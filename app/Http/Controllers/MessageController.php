<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function byUser(User $user)
    {
        $messages = Message::where('¡sender_id', auth()->id())
            ->where('receiver_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->where('receiver_id', auth()->id())
            ->latest()
            ->paginate(10);
            return inertia('Home', [
                'selelectedConversation' => $user->toConversationArray(),
                'messages' => MessageResource::collection($messages),
            ]);
    }
    public function byGroup(Group $group)
    {
        $messages = Message::where('group_id', $group->id)
            ->latest()
            ->paginate(10);
            return inertia('Home', [
                'selelectedConversation' => $group->toConversationArray(),
                'messages' => MessageResource::collection($messages),
            ]);
    }

    public function loadOlder(Message $message)
    {
        
    }
    
    public function store(StoreMessageRequest $request)
    {

    }

    public function destroy(Message $message)
    {
        
    }
}
