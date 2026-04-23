<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LogAktivitasController extends Controller
{
    public function index(): Response
    {
        $activityLogs = ActivityLog::query()
            ->with(['user:id,name,account_role'])
            ->latest()
            ->limit(25)
            ->get()
            ->map(fn(ActivityLog $log) => $this->formatActivityRow($log));

        $recentActivityByUser = $activityLogs
            ->filter(fn(array $log) => isset($log['user_id']))
            ->groupBy('user_id')
            ->map(fn($group) => $group->first())
            ->all();

        $activeUsers = User::query()
            ->select(['id', 'name', 'account_role', 'last_activity_at'])
            ->orderByDesc('last_activity_at')
            ->limit(25)
            ->get()
            ->map(function (User $user) use ($recentActivityByUser) {
                return $this->formatUserRow(
                    $user,
                    $recentActivityByUser[$user->id] ?? null,
                );
            });

        $staffUsers = $activeUsers
            ->filter(fn(array $user) => in_array($user['role_slug'], ['admin'], true))
            ->values()
            ->all();

        $borrowerUsers = $activeUsers
            ->reject(fn(array $user) => in_array($user['role_slug'], ['admin'], true))
            ->values()
            ->all();

        return Inertia::render('admin/log-aktivitas/log-aktivitas', [
            'staffUsers' => $staffUsers,
            'borrowerUsers' => $borrowerUsers,
            'activities' => $activityLogs->all(),
        ]);
    }

    protected function formatUserRow(User $user, ?array $recentActivity = null): array
    {
        $lastActivity = $user->last_activity_at ? Carbon::parse($user->last_activity_at) : null;
        $isOnline = $lastActivity?->greaterThanOrEqualTo(now()->subMinutes(5)) ?? false;

        $lastActivityText = $lastActivity
            ? 'aktif ' . $lastActivity->diffForHumans()
            : 'belum pernah aktif';

        return [
            'id' => $user->id,
            'name' => $user->name,
            'role' => $this->formatRole($user->account_role),
            'role_slug' => $user->account_role ?? 'peminjam',
            'is_online' => $isOnline,
            'status_badge' => $isOnline ? 'Online' : 'Offline',
            'last_activity_at' => $lastActivity?->toIso8601String(),
            'last_activity_text' => $lastActivityText,
            'activity_description' => $recentActivity['description'] ?? null,
            'activity_time_ago' => $recentActivity['time_ago'] ?? null,
        ];
    }

    protected function formatActivityRow(ActivityLog $log): array
    {
        $type = $this->resolveActivityType($log->description);

        $description = $this->sanitizeDescription($log);

        return [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'user_name' => $log->user?->name ?? __('Pengguna Tanpa Nama'),
            'role' => $this->formatRole($log->user?->account_role),
            'description' => $description,
            'type' => $type,
            'created_at' => $log->created_at?->toIso8601String(),
            'time_ago' => $log->created_at?->diffForHumans(),
        ];
    }

    private function sanitizeDescription(ActivityLog $log): string
    {
        $description = $log->description ?? '-';
        $actorName = $log->user?->name;

        if ($actorName) {
            $lowerDescription = Str::lower($description);
            $lowerName = Str::lower($actorName);
            if (Str::startsWith($lowerDescription, $lowerName)) {
                $description = ltrim(mb_substr($description, mb_strlen($actorName)), " -—:\n");
            }
        }

        return trim($description);
    }

    protected function resolveActivityType(?string $description): string
    {
        $text = Str::lower($description ?? '');

        return match (true) {
            Str::contains($text, ['kembali', 'dikembalikan']) => 'kembali',
            Str::contains($text, ['setuju', 'disetujui']) => 'disetujui',
            Str::contains($text, ['pinjam', 'meminjam']) => 'pinjam',
            default => 'lainnya',
        };
    }

    protected function formatRole(?string $role): ?string
    {
        return match ($role) {
            'admin' => 'Administrator',
            'peminjam' => 'Peminjam',
            default => $role,
        };
    }
}
