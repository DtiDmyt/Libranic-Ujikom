<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteKategoriAlatRequest;
use App\Http\Requests\StoreKategoriAlatRequest;
use App\Http\Requests\UpdateKategoriAlatRequest;
use App\Models\KategoriAlat;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class KategoriAlatController extends Controller
{
    public function index(): Response
    {
        $categories = KategoriAlat::query()
            ->orderBy('nama')
            ->get(['id', 'nama']);

        return Inertia::render('admin/buku/kategori', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreKategoriAlatRequest $request): RedirectResponse
    {
        KategoriAlat::create($request->validated());

        return redirect()->route('admin.kategori.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(UpdateKategoriAlatRequest $request, KategoriAlat $kategoriAlat): RedirectResponse
    {
        $kategoriAlat->update($request->validated());

        return redirect()->route('admin.kategori.index')->with('success', 'Kategori berhasil diperbarui.');
    }

    public function bulkDestroy(DeleteKategoriAlatRequest $request): RedirectResponse
    {
        KategoriAlat::whereIn('id', $request->validated('ids'))->delete();

        return redirect()->route('admin.kategori.index')->with('success', 'Kategori berhasil dihapus.');
    }
}
