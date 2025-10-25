<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AutoDemoLogin
{
    /**
     * If APP_DEMO=true, ensure there's a demo user and log them in.
     */
    public function handle(Request $request, Closure $next)
    {
        // Si es modo demo, siempre iniciamos sesión como usuario demo
        if (env('APP_DEMO', false)) {
            $user = User::firstOrCreate(
                ['email' => 'demo@local'],
                [
                    'name' => 'Demo User',
                    'password' => bcrypt('password'),
                ]
            );

            // Login via session
            Auth::login($user);
        }

        return $next($request);
    }
}