<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $statusFilter = $request->string('status')->toString() ?: 'semua';

        $query = Peminjaman::with(['alat', 'user']);

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('nama_peminjam', 'like', '%' . $search . '%')
                    ->orWhereHas('alat', function ($builder) use ($search) {
                        $builder->where('nama_alat', 'like', '%' . $search . '%');
                    });
            });
        }

        if ($statusFilter !== 'semua') {
            $query->where('status', $statusFilter);
        }

        $items = $query->latest('created_at')->get()->map(function (Peminjaman $loan) {
            $status = $loan->status ?? 'baik';

            $kondisi = match ($status) {
                'rusak' => 'rusak',
                'hilang' => 'hilang',
                default => 'baik',
            };

            return [
                'id' => $loan->id,
                'nama_barang' => $loan->alat?->nama_alat ?? '-',
                'peminjam' => $loan->nama_peminjam,
                'kelas' => $loan->kelas ?? '-',
                'jumlah' => $loan->jumlah_pinjam,
                'kondisi_barang' => $kondisi,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_pengembalian' => $loan->tanggal_kembali?->toDateString(),
                'status' => $loan->status ?? 'menunggu persetujuan',
            ];
        });

        $borrowers = Peminjaman::select('nama_peminjam as nama', 'kelas')
            ->distinct()
            ->get()
            ->map(fn($item) => [
                'nama' => $item->nama,
                'kelas' => $item->kelas,
            ]);

        return Inertia::render('petugas/peminjaman/daftar-peminjaman', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            'borrowers' => $borrowers,
        ]);
    }

    public function updateStatus(Request $request, Peminjaman $loan): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:menunggu,disetujui,ditolak'],
            'reason' => ['required_if:status,ditolak', 'string', 'max:500'],
        ]);

        $loan->status = $data['status'];
        $loan->alasan_penolakan = $data['status'] === 'ditolak'
            ? $data['reason']
            : null;
        $loan->save();

        return response()->json(['status' => 'ok']);
    }
}
