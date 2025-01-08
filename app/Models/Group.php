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
}
