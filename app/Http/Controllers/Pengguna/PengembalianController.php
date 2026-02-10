<?php

namespace App\Http\Controllers\Pengguna;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengembalianController extends Controller
{
    public function create(Request $request, Peminjaman $loan): Response
    {
        $user = $request->user();
        abort_unless($loan->user_id === $user->id, 403);

        $loan->loadMissing('alat');

        return Inertia::render('pengguna/pengembalian/form-pengembalian', [
            'borrower' => [
                'nama' => $user->name,
                'nis_nip' => $user->identitas ?? $user->email ?? '-',
                'kelas' => $user->kelas ?? '-',
            ],
            'alat' => [
                'nama_alat' => $loan->alat?->nama_alat ?? '-',
                'kode_alat' => $loan->alat?->kode_alat ?? '-',
                'lokasi' => $loan->alat?->ruangan ?? '-',
                'stok' => max(0, (int) ($loan->alat?->stok ?? 0)),
                'denda_keterlambatan' => max(0, (int) ($loan->alat?->denda_keterlambatan ?? 0)),
            ],
            'loan' => [
                'id' => $loan->id,
                'jumlah' => $loan->jumlah_pinjam,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
                'status' => $loan->status,
                'keperluan' => $loan->keperluan,
            ],
        ]);
    }

    public function store(Request $request, Peminjaman $loan): RedirectResponse
    {
        $user = $request->user();
        abort_unless($loan->user_id === $user->id, 403);

        if ($loan->pengembalian()->exists()) {
            return redirect()
                ->route('peminjaman.index')
                ->with('error', 'Pengembalian untuk transaksi ini sudah dikonfirmasi.');
        }

        $data = $request->validate([
            'kondisi' => ['required', 'in:baik,rusak,hilang'],
            'catatan' => ['nullable', 'string', 'max:1000'],
            'lampiran' => ['nullable', 'image', 'max:2048'],
        ]);

        $lampiranPath = null;
        if ($request->hasFile('lampiran')) {
            $lampiranPath = $request->file('lampiran')->store('pengembalian', 'public');
        }

        $pengembalian = Pengembalian::create([
            'peminjaman_id' => $loan->id,
            'user_id' => $user->id,
            'tanggal_pengembalian' => now()->toDateString(),
            'kondisi' => $data['kondisi'],
            'catatan' => $data['catatan'] ?? null,
            'lampiran_path' => $lampiranPath,
            'status' => 'menunggu',
        ]);

        $loan->status = 'dikembalikan';
        $loan->save();

        $loan->loadMissing('alat');
        $conditionLabel = match ($data['kondisi']) {
            'rusak' => 'rusak',
            'hilang' => 'hilang',
            default => 'baik',
        };

        ActivityLog::record(
            $user->id,
            sprintf(
                'mengembalikan %s dalam kondisi %s.',
                $loan->alat?->nama_alat ?? 'alat',
                $conditionLabel
            ),
            [
                'context' => 'pengembalian',
                'loan_id' => $loan->id,
                'pengembalian_id' => $pengembalian->id,
                'alat_id' => $loan->alat?->id,
                'alat_nama' => $loan->alat?->nama_alat,
                'kondisi' => $data['kondisi'],
            ]
        );

        return redirect()
            ->route('peminjaman.index')
            ->with('success', 'Pengembalian berhasil dikonfirmasi.');
    }
}
