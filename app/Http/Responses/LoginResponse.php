<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that redirects users to the proper dashboard after login.
     */
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        $redirectTo = $this->resolveRedirectPath($request);

        if ($request instanceof Request && $request->wantsJson()) {
            return new JsonResponse(['redirect' => $redirectTo], 200);
        }

        return redirect()->to($redirectTo);
    }

    private function resolveRedirectPath(Request $request): string
    {
        $role = $request->user()->account_role ?? 'peminjam';

        return match ($role) {
            'admin' => route('admin.dashboard'),
            'petugas' => route('petugas.dashboard'),
            default => route('dashboard'),
        };
    }
}
