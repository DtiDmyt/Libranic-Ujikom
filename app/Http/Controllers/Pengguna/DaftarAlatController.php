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
            ->where('status', 'publik')
            ->orderBy('nama_alat')
            ->get()
            ->map(function (DaftarBarang $item) {
                return [
                    'id' => $item->id,
                    'nama_alat' => $item->nama_alat,
                    'lokasi' => $item->ruangan,
                    'stok' => max(0, (int) ($item->stok ?? 0)),
                    'gambar_url' => $item->gambar_url,
                    'status' => $item->status === 'publik' ? 'tersedia' : 'habis',
                ];
            })
            ->values();

        return Inertia::render('pengguna/daftar-alat/daftar-alat', [
            'items' => $items,
        ]);
    }
}
