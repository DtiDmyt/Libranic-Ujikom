<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkDeleteDaftarBarangRequest;
use App\Http\Requests\BulkUpdateStatusDaftarBarangRequest;
use App\Http\Requests\StoreDaftarBarangRequest;
use App\Http\Requests\UpdateDaftarBarangRequest;
use App\Models\DaftarBarang;
use App\Models\KategoriAlat;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DaftarBarangController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString() ?: 'semua',
            'kategori' => $request->integer('kategori') ?: null,
            'jurusan' => $request->string('jurusan')->toString() ?: null,
        ];

        $items = DaftarBarang::query()
            ->with('kategoriAlat:id,nama')
            ->when($filters['search'], fn($query, $search) => $query->where('nama_alat', 'like', '%' . $search . '%'))
            ->when($filters['status'] && $filters['status'] !== 'semua', fn($query) => $query->where('status', $filters['status']))
            ->when($filters['kategori'], fn($query) => $query->where('kategori_alat_id', $filters['kategori']))
            ->when($filters['jurusan'], fn($query) => $query->where('kategori_jurusan', $filters['jurusan']))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn(DaftarBarang $item) => [
                'id' => $item->id,
                'nama_alat' => $item->nama_alat,
                'kategori_jurusan' => $item->kategori_jurusan,
                'kategori_alat' => $item->kategoriAlat?->nama,
                'ruangan' => $item->ruangan,
                'denda_keterlambatan' => $item->denda_keterlambatan,
                'status' => $item->status,
                'gambar_url' => $item->gambar_url,
                'created_at' => $item->created_at?->toIso8601String(),
            ])
            ->values();

        $categories = KategoriAlat::query()
            ->orderBy('nama')
            ->get(['id', 'nama']);

        $statistics = [
            'total' => DaftarBarang::count(),
            'publik' => DaftarBarang::where('status', 'publik')->count(),
            'draft' => DaftarBarang::where('status', 'draft')->count(),
        ];

        return Inertia::render('admin/alat/data', [
            'items' => $items,
            'filters' => $filters,
            'categories' => $categories,
            'statistics' => $statistics,
        ]);
    }

    public function create(): Response
    {
        $categories = KategoriAlat::query()->orderBy('nama')->get(['id', 'nama']);

        return Inertia::render('admin/alat/tambah-data', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreDaftarBarangRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['denda_keterlambatan'] = (int) ($data['denda_keterlambatan'] ?? 0);
        $data['gambar_path'] = $this->storeImage($request->file('gambar'));

        unset($data['gambar']);

        DaftarBarang::create($data);

        return redirect()
            ->route('admin.alat.data.index')
            ->with('success', 'Data alat berhasil ditambahkan.');
    }

    public function edit(DaftarBarang $daftarBarang): Response
    {
        $categories = KategoriAlat::query()->orderBy('nama')->get(['id', 'nama']);

        return Inertia::render('admin/alat/edit-data', [
            'item' => [
                'id' => $daftarBarang->id,
                'nama_alat' => $daftarBarang->nama_alat,
                'kategori_jurusan' => $daftarBarang->kategori_jurusan,
                'kategori_alat_id' => $daftarBarang->kategori_alat_id,
                'ruangan' => $daftarBarang->ruangan,
                'denda_keterlambatan' => $daftarBarang->denda_keterlambatan,
                'status' => $daftarBarang->status,
                'gambar_url' => $daftarBarang->gambar_url,
            ],
            'categories' => $categories,
        ]);
    }

    public function update(UpdateDaftarBarangRequest $request, DaftarBarang $daftarBarang): RedirectResponse
    {
        $data = $request->validated();
        $data['denda_keterlambatan'] = (int) ($data['denda_keterlambatan'] ?? 0);

        $data['gambar_path'] = $this->storeImage(
            $request->file('gambar'),
            $daftarBarang->getRawOriginal('gambar_path')
        );

        unset($data['gambar']);

        $daftarBarang->update($data);

        return redirect()
            ->route('admin.alat.data.index')
            ->with('success', 'Data alat berhasil diperbarui.');
    }

    public function destroy(DaftarBarang $daftarBarang): RedirectResponse
    {
        $this->deleteImage($daftarBarang->getRawOriginal('gambar_path'));
        $daftarBarang->delete();

        return redirect()
            ->route('admin.alat.data.index')
            ->with('success', 'Data alat berhasil dihapus.');
    }

    public function bulkDestroy(BulkDeleteDaftarBarangRequest $request): RedirectResponse
    {
        $items = DaftarBarang::whereIn('id', $request->validated('ids'))->get();

        $items->each(fn(DaftarBarang $item) => $this->deleteImage($item->getRawOriginal('gambar_path')));

        DaftarBarang::whereIn('id', $items->pluck('id'))->delete();

        return redirect()
            ->route('admin.alat.data.index')
            ->with('success', 'Data alat terpilih berhasil dihapus.');
    }

    public function bulkUpdateStatus(BulkUpdateStatusDaftarBarangRequest $request): RedirectResponse
    {
        DaftarBarang::whereIn('id', $request->validated('ids'))
            ->update(['status' => $request->validated('status')]);

        return redirect()
            ->route('admin.alat.data.index')
            ->with('success', 'Status data alat berhasil diperbarui.');
    }

    private function storeImage(?UploadedFile $file, ?string $existingPath = null): ?string
    {
        if (! $file) {
            return $existingPath;
        }

        if ($existingPath) {
            $this->deleteImage($existingPath);
        }

        return $file->store('alat', 'public');
    }

    private function deleteImage(?string $path): void
    {
        if (! $path) {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}
