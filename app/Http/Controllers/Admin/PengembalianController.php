<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengembalian;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengembalianController extends Controller
{
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

        $items = $query->orderBy('tanggal_pengembalian', 'desc')
            ->get()
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

    public function updateStatus(Request $request, Pengembalian $pengembalian): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:menunggu,tepat waktu,telat,rusak,hilang'],
        ]);

        $pengembalian->status = $data['status'];
        $pengembalian->save();

        return response()->json(['status' => 'ok']);
    }

    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:pengembalian,id'],
            'status' => ['required', 'in:menunggu,tepat waktu,telat,rusak,hilang'],
        ]);

        Pengembalian::whereIn('id', $data['ids'])->update([
            'status' => $data['status'],
        ]);

        return response()->json(['status' => 'ok']);
    }

    public function destroy(Pengembalian $pengembalian): JsonResponse
    {
        $pengembalian->delete();

        return response()->json(['status' => 'ok']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:pengembalian,id'],
        ]);

        Pengembalian::whereIn('id', $data['ids'])->delete();

        return response()->json(['status' => 'ok']);
    }
}
