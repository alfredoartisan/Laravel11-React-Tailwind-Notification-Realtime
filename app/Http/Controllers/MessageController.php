<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageAttachment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Events\SocketMessage;

class MessageController extends Controller
{
    public function byUser(User $user)
    {
        $authId = request()->user()->id;
        $messages = Message::where(function ($query) use ($user, $authId) {
            $query->where('sender_id', $authId)
                ->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($user, $authId) {
            $query->where('sender_id', $user->id)
                ->where('receiver_id', $authId);
        })
            ->latest()
            ->paginate(10);

        $selectedConversation = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'is_group' => false,
            'is_user' => true,
            'users' => [$user->toArray()],
        ];

        return inertia('Home', [
            'messages' => MessageResource::collection($messages),
            'selectedConversation' => $selectedConversation,
        ]);
    }
    public function byGroup(Group $group)
    {
        // Cargar los usuarios del grupo
        $group->load('users');

        $messages = Message::where('group_id', $group->id)
            ->latest()
            ->paginate(10);

        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    public function loadOlder(Message $message)
    {
        if ($message->group_id) {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where('group_id', $message->group_id)
                ->latest()
                ->paginate(10);
        } else {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                        ->where('receiver_id', $message->receiver_id)
                        ->orWhere('sender_id', $message->receiver_id)
                        ->where('receiver_id', $message->sender_id);
                })
                ->latest()
                ->paginate(10);
        }
        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();
        $data['sender_id'] = request()->user()->id;
        $receiverId = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;

        $files = $data['attachments'] ?? [];

        $message = Message::create($data);

        $attachments = [];
        if ($files) {
            foreach ($files as $file) {
                $directory = 'attachments/' . Str::random(32);
                Storage::makeDirectory($directory);

                $attachment = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'type' => $file->getClientMimeType(),
                    'path' => $file->store($directory, 'public'),
                ];
                $attachments[] = MessageAttachment::create($attachment);
            }
        }

        // Cargar las relaciones necesarias para el frontend
        $message->load('sender');

        // Si es un mensaje de conversación (no grupo), actualizar la conversación
        if ($receiverId) {
            \App\Models\Conversation::updateConversationWithMessage($data['sender_id'], $receiverId, $message);
        }

        // El evento se dispara manualmente después de actualizar la conversación
        SocketMessage::dispatch($message);

        return response()->json([
            'message' => new MessageResource($message),
            'attachments' => $attachments,
        ], 201);
    }

    public function destroy(Message $message)
    {
        if ($message->sender_id !== request()->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message->delete();

        return response('', 204);
    }
}
