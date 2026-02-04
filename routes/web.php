<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DaftarBarangController;
use App\Http\Controllers\Admin\KategoriAlatController;

Route::get('/', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    $role = auth()->user()->account_role ?? 'peminjam';

    $routeName = match ($role) {
        'admin' => 'admin.dashboard',
        'petugas' => 'petugas.dashboard',
        default => 'dashboard',
    };

    return redirect()->intended(route($routeName));
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:peminjam')->name('dashboard');

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('admin/dashboard/dashboard');
        })->name('dashboard');

        Route::get('alat/kategori', [KategoriAlatController::class, 'index'])->name('kategori.index');
        Route::post('alat/kategori', [KategoriAlatController::class, 'store'])->name('kategori.store');
        Route::patch('alat/kategori/{kategoriAlat}', [KategoriAlatController::class, 'update'])->name('kategori.update');
        Route::delete('alat/kategori/bulk-delete', [KategoriAlatController::class, 'bulkDestroy'])->name('kategori.bulk-destroy');

        Route::prefix('alat')->name('alat.')->group(function () {
            Route::get('data', [DaftarBarangController::class, 'index'])->name('data.index');
            Route::get('data/tambah', [DaftarBarangController::class, 'create'])->name('data.create');
            Route::post('data', [DaftarBarangController::class, 'store'])->name('data.store');
            Route::get('data/{daftarBarang}/edit', [DaftarBarangController::class, 'edit'])->name('data.edit');
            Route::patch('data/{daftarBarang}', [DaftarBarangController::class, 'update'])->name('data.update');
            Route::delete('data/{daftarBarang}', [DaftarBarangController::class, 'destroy'])->name('data.destroy');
            Route::delete('data/bulk-delete', [DaftarBarangController::class, 'bulkDestroy'])->name('data.bulk-destroy');
            Route::patch('data/bulk-status', [DaftarBarangController::class, 'bulkUpdateStatus'])->name('data.bulk-status');
        });
    });

    Route::get('petugas/dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:petugas')->name('petugas.dashboard');
});

require __DIR__ . '/settings.php';
