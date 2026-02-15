<?php

namespace App\Http\Controllers\Petugas;

use App\Concerns\HandlesReturnPenalty;
use App\Http\Controllers\Controller;
use App\Models\Pengembalian;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PengembalianController extends Controller
{
    use HandlesReturnPenalty;
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

        $returns = $query->latest('tanggal_pengembalian')->get();

        $returns->each(function (Pengembalian $return) {
            $this->syncReturnPenalty($return);
        });

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
                    'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                    'batas_peminjaman' => $loan->tanggal_kembali?->toDateString(),
                    'tanggal_dikembalikan' => $return->tanggal_pengembalian?->toDateString(),
                    'status' => $return->status ?? 'menunggu',
                    'catatan_petugas' => $return->catatan_petugas,
                    'telat_hari' => $return->telat_hari,
                    'total_denda' => $return->total_denda,
                    'detail_url' => route('petugas.pengembalian.show', $return),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('petugas/pengembalian/daftar-pengembalian', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    public function show(Pengembalian $pengembalian): Response
    {
        $pengembalian->loadMissing(['peminjaman', 'peminjaman.alat']);
        $loan = $pengembalian->peminjaman;

        return Inertia::render('petugas/pengembalian/detail-pengembalian', [
            'loan' => [
                'id' => $loan?->id,
                'nama_alat' => $loan?->alat?->nama_alat ?? '-',
                'kode_alat' => $loan?->alat?->kode_alat ?? '-',
                'lokasi' => $loan?->alat?->ruangan ?? '-',
                'nama_peminjam' => $loan?->nama_peminjam ?? '-',
                'kelas' => $loan?->kelas ?? '-',
                'jumlah' => $loan?->jumlah_pinjam ?? 0,
                'tanggal_pinjam' => $loan?->tanggal_pinjam?->toDateString(),
                'tanggal_kembali' => $loan?->tanggal_kembali?->toDateString(),
            ],
            'pengembalian' => [
                'id' => $pengembalian->id,
                'tanggal_pengembalian' => $pengembalian->tanggal_pengembalian?->toDateString(),
                'kondisi' => $pengembalian->kondisi,
                'catatan' => $pengembalian->catatan,
                'catatan_petugas' => $pengembalian->catatan_petugas,
                'lampiran_url' => $pengembalian->lampiran_path
                    ? Storage::url($pengembalian->lampiran_path)
                    : null,
                'status' => $pengembalian->status ?? 'menunggu',
                'telat_hari' => $pengembalian->telat_hari,
                'total_denda' => $pengembalian->total_denda,
            ],
            'status_label' => $this->statusLabel($pengembalian->status ?? 'menunggu'),
        ]);
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

        if ($tool && $amount > 0) {
            if (!$wasReleased && $shouldRelease) {
                $tool->releaseStock($amount);
            } elseif ($wasReleased && !$shouldRelease) {
                $tool->reserveStock($amount);
            }
        }

        $this->syncReturnPenalty($pengembalian);

        return response()->json(['status' => 'ok']);
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'tepat waktu' => 'Tepat Waktu',
            'telat' => 'Telat',
            'rusak' => 'Rusak',
            'hilang' => 'Hilang',
            default => 'Proses Pengecekan',
        };
    }
}
