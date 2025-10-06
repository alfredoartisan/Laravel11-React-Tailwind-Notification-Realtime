<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    //hasfactory se utiliza para crear modelos de forma mas sencilla
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'group_id',
        'user_id',
        'owner_id',
        'last_message_id',
        

    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'group_user');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function owner()
    {
        return $this->belongsToMany(User::class);
    }

    public static function getGroupsForUser(User $user)
    {
        $query = self::select(['groups.*', 'messages.message as last_message', 'messages.created_at as last_message_date'])
            ->join('group_user', 'groups.id', '=', 'group_user.group_id')
            ->leftJoin('messages', 'groups.last_message_id', '=', 'messages.id')
            ->where('group_user.user_id', $user->id)
            ->orderBy('last_message_date', 'desc')
            ->orderBy('groups.name');

            return $query->get();
    }

    public function toConversationArray()
    {
        // Cargamos la relación users si no está ya cargada
        if (!$this->relationLoaded('users')) {
            $this->load('users');
        }
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'is_group' => true,
            'is_user' => false,
            'owner_id' => $this->owner_id,
            'users' => $this->users, // Incluir usuarios completos, no solo IDs
            'users_count' => $this->users->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date,
        ];
    }

    public static function updateGroupWithMessage($groupId, $message)
    {
        return self::updateOrCreate(
            ['id' => $groupId],
            ['last_message_id' => $message->id]
        );
    }
}
