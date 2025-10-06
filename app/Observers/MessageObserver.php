<?php

namespace App\Observers;

use App\Models\Message;
use App\Events\SocketMessage;

class MessageObserver
{
    /**
     * Handle the Message "created" event.
     */
    public function created(Message $message): void
    {
        event(new SocketMessage($message));
    }
}
