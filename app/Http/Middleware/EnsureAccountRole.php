<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountRole
{
    /**
     * Ensure the authenticated user matches one of the expected account roles.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null || empty($roles)) {
            abort(403);
        }

        if (! in_array($user->account_role, $roles, true)) {
            abort(403);
        }

        return $next($request);
    }
}
