<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Redirect newly registered users to the login page.
     */
    public function toResponse($request)
    {
        $guardName = config('fortify.guard');
        $guard = $guardName ? Auth::guard($guardName) : Auth::guard();

        if ($guard->check()) {
            $guard->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($request instanceof Request && $request->wantsJson()) {
            return new JsonResponse([], 201);
        }

        return redirect()
            ->route('login')
            ->with('status', 'Registrasi berhasil! Silakan masuk.');
    }
}
