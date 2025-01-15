<?php
// filepath: /c:/Users/usuario/Documents/GitHub/Laravel11-React-Tailwind-Notification-Realtime/app/Providers/BroadcastServiceProvider.php


namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Broadcast::routes();

        require base_path('routes/channels.php');
    }
}