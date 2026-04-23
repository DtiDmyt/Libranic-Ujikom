<?php

namespace App\Http\Controllers\Pengguna;

use App\Http\Controllers\Controller;
use App\Models\DaftarBarang;
use Inertia\Inertia;
use Inertia\Response;

class DaftarAlatController extends Controller
{
    public function index(): Response
    {
        $items = DaftarBarang::query()
            ->with('kategoriAlat:id,nama')
            ->where('status', 'publik')
            ->orderBy('nama_alat')
            ->get()
            ->map(function (DaftarBarang $item) {
                return [
                    'id' => $item->id,
                    'judul_buku' => $item->judul_buku ?? $item->nama_alat,
                    'nama_alat' => $item->nama_alat,
                    'penulis' => $item->penulis,
                    'penerbit' => $item->penerbit,
                    'tahun_terbit' => $item->tahun_terbit,
                    'kategori_buku' => $item->kategoriAlat?->nama,
                    'lokasi' => $item->ruangan,
                    'lokasi_rak' => $item->lokasi_rak ?? $item->ruangan,
                    'stok' => max(0, (int) ($item->stok ?? 0)),
                    'gambar_url' => $item->gambar_url,
                    'status_buku' => $item->status_buku,
                    'status' => $item->status === 'publik' ? 'tersedia' : 'habis',
                    'denda_keterlambatan' => (int) ($item->denda_keterlambatan ?? 0),
                    'kondisi_alat' => $item->kondisi_alat,
                    'deskripsi' => $item->deskripsi,
                ];
            })
            ->values();

        return Inertia::render('pengguna/daftar-buku/daftar-alat', [
            'items' => $items,
        ]);
    }
}
