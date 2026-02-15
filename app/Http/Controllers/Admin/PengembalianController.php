<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesReturnPenalty;
use App\Http\Controllers\Controller;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PengembalianController extends Controller
{
    use HandlesReturnPenalty;

    public function create(): Response
    {
        return Inertia::render('admin/manajamen-peminjaman/data-pengembalian/tambah-pengembalian', [
            'loans' => $this->availableLoansForReturn(),
            'defaultDate' => Carbon::today()->toDateString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'peminjaman_id' => ['required', 'exists:peminjaman,id'],
            'tanggal_pengembalian' => ['required', 'date'],
            'kondisi' => ['required', 'in:baik,rusak,hilang'],
            'catatan' => ['nullable', 'string', 'max:1000'],
            'lampiran' => ['nullable', 'image', 'max:2048'],
        ]);

        $loan = Peminjaman::with('pengembalian')->findOrFail($validated['peminjaman_id']);

        if ($loan->pengembalian()->exists()) {
            return redirect()
                ->back()
                ->with('error', 'Pengembalian untuk peminjaman ini sudah tercatat.');
        }

        if ($loan->status === 'ditolak') {
            return redirect()
                ->back()
                ->with('error', 'Peminjaman yang ditolak tidak bisa dikembalikan.');
        }

        $lampiranPath = null;
        if ($request->hasFile('lampiran')) {
            $lampiranPath = $request->file('lampiran')->store('pengembalian', 'public');
        }

        $return = Pengembalian::create([
            'peminjaman_id' => $loan->id,
            'user_id' => $request->user()?->id,
            'tanggal_pengembalian' => $validated['tanggal_pengembalian'],
            'kondisi' => $validated['kondisi'],
            'catatan' => $validated['catatan'] ?? null,
            'lampiran_path' => $lampiranPath,
            'status' => 'menunggu',
        ]);

        $this->syncReturnPenalty($return);

        $loan->status = 'dikembalikan';
        $loan->save();

        return redirect()
            ->route('admin.data-pengembalian.pengembalian.index')
            ->with('success', 'Pengembalian berhasil dicatat.');
    }

    public function edit(Pengembalian $pengembalian): Response
    {
        $pengembalian->loadMissing('peminjaman.alat');

        $loan = $pengembalian->peminjaman;

        return Inertia::render('admin/manajamen-peminjaman/data-pengembalian/edit-pengembalian', [
            'loan' => [
                'id' => $loan?->id,
                'nama_peminjam' => $loan?->nama_peminjam ?? '-',
                'kelas' => $loan?->kelas,
                'nis_nip' => $loan?->nis_nip,
                'alat_nama' => $loan->alat?->nama_alat ?? '-',
                'kode_alat' => $loan->alat?->kode_alat ?? '-',
                'ruangan' => $loan->alat?->ruangan ?? '-',
                'jumlah_pinjam' => $loan?->jumlah_pinjam,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
            ],
            'pengembalian' => [
                'id' => $pengembalian->id,
                'tanggal_pengembalian' => $pengembalian->tanggal_pengembalian?->toDateString(),
                'kondisi' => $pengembalian->kondisi ?? 'baik',
                'catatan' => $pengembalian->catatan,
                'catatan_petugas' => $pengembalian->catatan_petugas,
                'status' => $pengembalian->status,
                'lampiran_url' => $pengembalian->lampiran_path ? Storage::url($pengembalian->lampiran_path) : null,
                'lampiran_name' => $pengembalian->lampiran_path ? basename($pengembalian->lampiran_path) : null,
                'telat_hari' => $pengembalian->telat_hari,
                'total_denda' => $pengembalian->total_denda,
            ],
        ]);
    }

    public function update(Request $request, Pengembalian $pengembalian): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal_pengembalian' => ['required', 'date'],
            'kondisi' => ['required', 'in:baik,rusak,hilang'],
            'catatan' => ['nullable', 'string', 'max:1000'],
            'lampiran' => ['nullable', 'image', 'max:2048'],
        ]);

        $lampiranPath = $pengembalian->lampiran_path;
        if ($request->hasFile('lampiran')) {
            if ($lampiranPath) {
                Storage::disk('public')->delete($lampiranPath);
            }
            $lampiranPath = $request->file('lampiran')->store('pengembalian', 'public');
        }

        $pengembalian->update([
            'tanggal_pengembalian' => $validated['tanggal_pengembalian'],
            'kondisi' => $validated['kondisi'],
            'catatan' => $validated['catatan'] ?? null,
            'lampiran_path' => $lampiranPath,
        ]);

        $this->syncReturnPenalty($pengembalian);

        return redirect()
            ->route('admin.data-pengembalian.pengembalian.index')
            ->with('success', 'Data pengembalian berhasil diperbarui.');
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $statusFilter = $request->string('status')->toString() ?: 'semua';

        $query = Pengembalian::with(['peminjaman', 'peminjaman.alat'])
            ->whereNotNull('tanggal_pengembalian');

        if ($statusFilter !== 'semua') {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $query->whereHas('peminjaman', function ($builder) use ($search) {
                $builder->where('nama_peminjam', 'like', '%' . $search . '%')
                    ->orWhereHas('alat', function ($builder) use ($search) {
                        $builder->where('nama_alat', 'like', '%' . $search . '%');
                    });
            });
        }

        $returns = $query->orderBy('tanggal_pengembalian', 'desc')->get();
        $returns->each(fn(Pengembalian $return) => $this->syncReturnPenalty($return));

        $items = $returns
            ->map(function (Pengembalian $return) {
                $loan = $return->peminjaman;
                return [
                    'pengembalian_id' => $return->id,
                    'loan_id' => $loan?->id,
                    'nama_barang' => $loan->alat?->nama_alat ?? '-',
                    'peminjam' => $loan->nama_peminjam ?? '-',
                    'kelas' => $loan->kelas ?? '-',
                    'jumlah' => $loan->jumlah_pinjam ?? 0,
                    'batas_peminjaman' => $loan->tanggal_kembali?->toDateString(),
                    'tanggal_dikembalikan' => $return->tanggal_pengembalian?->toDateString(),
                    'status' => $return->status ?? 'menunggu',
                    'catatan_petugas' => $return->catatan_petugas,
                    'telat_hari' => $return->telat_hari,
                    'total_denda' => $return->total_denda,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('admin/manajamen-peminjaman/data-pengembalian/daftar-pengembalian', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    private function availableLoansForReturn(): array
    {
        $query = Peminjaman::with(['alat', 'user'])
            ->whereDoesntHave('pengembalian')
            ->where(function ($builder) {
                $builder->whereNull('status')
                    ->orWhereNotIn('status', ['ditolak', 'selesai']);
            })
            ->orderByDesc('tanggal_pinjam');

        return $query->get()
            ->map(function (Peminjaman $loan) {
                return [
                    'id' => $loan->id,
                    'nama_peminjam' => $loan->nama_peminjam ?? $loan->user?->name ?? '-',
                    'kelas' => $loan->kelas,
                    'nis_nip' => $loan->nis_nip,
                    'alat_nama' => $loan->alat?->nama_alat ?? '-',
                    'kode_alat' => $loan->alat?->kode_alat ?? '-',
                    'ruangan' => $loan->alat?->ruangan ?? '-',
                    'jumlah_pinjam' => $loan->jumlah_pinjam,
                    'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                    'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
                ];
            })
            ->values()
            ->all();
    }

    public function updateStatus(Request $request, Pengembalian $pengembalian): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:menunggu,tepat waktu,telat,rusak,hilang'],
            'catatan_petugas' => ['nullable', 'string', 'max:1000'],
        ]);

        $requiresNote = in_array($data['status'], ['rusak', 'hilang'], true);
        $note = $data['catatan_petugas'] ?? null;

        if ($requiresNote && (! $note || trim((string) $note) === '')) {
            return response()->json([
                'message' => 'Catatan wajib diisi untuk status rusak atau hilang.',
            ], 422);
        }

        $previousStatus = $pengembalian->status ?? 'menunggu';
        $pengembalian->status = $data['status'];
        $pengembalian->catatan_petugas = $requiresNote ? $note : null;
        $pengembalian->save();

        $releaseStatuses = ['tepat waktu', 'telat'];
        $wasReleased = in_array($previousStatus, $releaseStatuses, true);
        $shouldRelease = in_array($data['status'], $releaseStatuses, true);

        if ($wasReleased === $shouldRelease) {
            $this->syncReturnPenalty($pengembalian);
            return response()->json(['status' => 'ok']);
        }

        $pengembalian->loadMissing('peminjaman.alat');
        $loan = $pengembalian->peminjaman;
        $tool = $loan?->alat;
        $amount = (int) ($loan->jumlah_pinjam ?? 0);

        if (!$tool || $amount <= 0) {
            $this->syncReturnPenalty($pengembalian);
            return response()->json(['status' => 'ok']);
        }

        if (!$wasReleased && $shouldRelease) {
            $tool->releaseStock($amount);
        } elseif ($wasReleased && !$shouldRelease) {
            $tool->reserveStock($amount);
        }

        $this->syncReturnPenalty($pengembalian);

        return response()->json(['status' => 'ok']);
    }

    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:pengembalian,id'],
            'status' => ['required', 'in:menunggu,tepat waktu,telat,rusak,hilang'],
        ]);

        $returns = Pengembalian::with(['peminjaman', 'peminjaman.alat'])
            ->whereIn('id', $data['ids'])
            ->get();

        $releaseStatuses = ['tepat waktu', 'telat'];
        $requiresNote = in_array($data['status'], ['rusak', 'hilang'], true);

        foreach ($returns as $return) {
            $previousStatus = $return->status ?? 'menunggu';

            $return->status = $data['status'];
            if (! $requiresNote) {
                $return->catatan_petugas = null;
            }
            $return->save();

            $wasReleased = in_array($previousStatus, $releaseStatuses, true);
            $shouldRelease = in_array($data['status'], $releaseStatuses, true);

            if ($wasReleased !== $shouldRelease) {
                $loan = $return->peminjaman;
                $tool = $loan?->alat;
                $amount = (int) ($loan->jumlah_pinjam ?? 0);

                if ($tool && $amount > 0) {
                    if (! $wasReleased && $shouldRelease) {
                        $tool->releaseStock($amount);
                    } elseif ($wasReleased && ! $shouldRelease) {
                        $tool->reserveStock($amount);
                    }
                }
            }

            $this->syncReturnPenalty($return);
        }

        return response()->json(['status' => 'ok']);
    }

    public function destroy(Pengembalian $pengembalian): RedirectResponse
    {
        $pengembalian->delete();

        return redirect()
            ->route('admin.data-pengembalian.pengembalian.index')
            ->with('success', 'Data pengembalian berhasil dihapus.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:pengembalian,id'],
        ]);

        Pengembalian::whereIn('id', $data['ids'])->delete();

        return redirect()
            ->route('admin.data-pengembalian.pengembalian.index')
            ->with('success', 'Data pengembalian terpilih berhasil dihapus.');
    }
}
