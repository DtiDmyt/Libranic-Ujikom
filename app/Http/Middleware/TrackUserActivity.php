<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if ($user && $user->isFillable('last_activity_at')) {
            $originalTimestamps = $user->timestamps;
            $user->timestamps = false;
            $user->forceFill([
                'last_activity_at' => now(),
                'is_online' => true,
            ])->saveQuietly();
            $user->timestamps = $originalTimestamps;
        }

        return $response;
    }
}
