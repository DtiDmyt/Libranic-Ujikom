<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;

class LogoutResponse implements LogoutResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        if ($request instanceof Request && $request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        return redirect()
            ->route('login')
            ->with('success', 'Anda berhasil keluar.');
    }
}
