<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkDeleteAdministratorRequest;
use App\Http\Requests\BulkUpdateAdministratorStatusRequest;
use App\Http\Requests\StoreAdministratorRequest;
use App\Http\Requests\UpdateAdministratorRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdministratorController extends Controller
{
    public function index(Request $request): Response
    {
        $roles = $this->availableRoles();
        $statuses = $this->availableStatuses();
        $currentUserId = Auth::id();

        $filters = [
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'status' => $request->string('status')->toString() ?: 'semua',
            'role' => $request->string('role')->toString() ?: 'semua',
        ];

        $baseQuery = User::query()->whereIn('account_role', $roles);

        $items = (clone $baseQuery)
            ->when($filters['name'], fn($query, $name) =>
            $query->where('name', 'like', '%' . $name . '%'))
            ->when($filters['email'], fn($query, $email) =>
            $query->where('email', 'like', '%' . $email . '%'))
            ->when($filters['status'] !== 'semua', fn($query) => $query->where('status', $filters['status']))
            ->when($filters['role'] !== 'semua', fn($query) => $query->where('account_role', $filters['role']))
            ->orderBy('name')
            ->get()
            ->map(function (User $user) use ($currentUserId) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_role' => $user->account_role,
                    'status' => $user->status,
                    'phone' => $user->phone,
                    'kelas' => $user->kelas,
                    'identitas' => $user->identitas,
                    'created_at' => $user->created_at?->toIso8601String(),
                    'can_manage' => $currentUserId !== $user->id,
                ];
            })
            ->values();

        $statistics = [
            'total' => (clone $baseQuery)->count(),
            'aktif' => (clone $baseQuery)->where('status', 'aktif')->count(),
            'nonaktif' => (clone $baseQuery)->where('status', 'nonaktif')->count(),
            'admin' => (clone $baseQuery)->where('account_role', 'admin')->count(),
            'petugas' => (clone $baseQuery)->where('account_role', 'petugas')->count(),
        ];

        return Inertia::render('admin/master-data/administrator', [
            'items' => $items,
            'filters' => $filters,
            'statistics' => $statistics,
            'roles' => $roles,
            'statuses' => $statuses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/master-data/tambah-admin', [
            'roles' => $this->availableRoles(),
        ]);
    }

    public function store(StoreAdministratorRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'account_role' => $data['account_role'],
            'status' => 'aktif',
            'role' => 'guru',
            'kelas' => null,
            'identitas' => null,
            'password' => Hash::make($data['password']),
        ]);

        return redirect()
            ->route('admin.master-data.administrator.index')
            ->with('success', 'Administrator baru berhasil ditambahkan.');
    }

    public function edit(User $administrator): Response
    {
        $this->ensureManageable($administrator);

        return Inertia::render('admin/master-data/edit-admin', [
            'user' => [
                'id' => $administrator->id,
                'name' => $administrator->name,
                'email' => $administrator->email,
                'account_role' => $administrator->account_role,
                'status' => $administrator->status,
            ],
            'roles' => $this->availableRoles(),
        ]);
    }

    public function update(UpdateAdministratorRequest $request, User $administrator): RedirectResponse
    {
        $this->ensureManageable($administrator);

        $data = $request->validated();

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'account_role' => $data['account_role'],
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $administrator->update($payload);

        return redirect()
            ->route('admin.master-data.administrator.index')
            ->with('success', 'Data administrator berhasil diperbarui.');
    }

    public function destroy(User $administrator): RedirectResponse
    {
        $this->ensureManageable($administrator);
        $currentUserId = Auth::id();

        if ($currentUserId === $administrator->id) {
            return redirect()
                ->route('admin.master-data.administrator.index')
                ->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan.');
        }

        $administrator->delete();

        return redirect()
            ->route('admin.master-data.administrator.index')
            ->with('success', 'Akun administrator berhasil dihapus.');
    }

    public function bulkDestroy(BulkDeleteAdministratorRequest $request): RedirectResponse
    {
        $currentUserId = Auth::id();

        $ids = collect($request->validated('ids'))
            ->filter(fn($id) => $id !== $currentUserId)
            ->values();

        if ($ids->isEmpty()) {
            return redirect()
                ->route('admin.master-data.administrator.index')
                ->with('error', 'Tidak ada akun yang dapat dihapus.');
        }

        User::whereIn('id', $ids)->delete();

        return redirect()
            ->route('admin.master-data.administrator.index')
            ->with('success', 'Akun terpilih berhasil dihapus.');
    }

    public function bulkUpdateStatus(BulkUpdateAdministratorStatusRequest $request): RedirectResponse
    {
        $status = $request->validated('status');
        $currentUserId = Auth::id();

        $ids = collect($request->validated('ids'))
            ->filter(fn($id) => $id !== $currentUserId)
            ->values();

        if ($ids->isEmpty()) {
            return redirect()
                ->route('admin.master-data.administrator.index')
                ->with('error', 'Tidak ada akun yang dapat diperbarui.');
        }

        User::whereIn('id', $ids)->update(['status' => $status]);

        return redirect()
            ->route('admin.master-data.administrator.index')
            ->with('success', 'Status akun terpilih berhasil diperbarui.');
    }

    private function ensureManageable(User $user): void
    {
        if (! in_array($user->account_role, $this->availableRoles(), true)) {
            abort(404);
        }
    }

    /**
     * @return list<string>
     */
    private function availableRoles(): array
    {
        return config('administrator.roles', ['admin', 'petugas']);
    }

    /**
     * @return list<string>
     */
    private function availableStatuses(): array
    {
        return config('administrator.statuses', ['aktif', 'nonaktif']);
    }
}
