<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AdministratorController;
use App\Http\Controllers\Admin\DaftarBarangController;
use App\Http\Controllers\Admin\KategoriAlatController;
use App\Http\Controllers\Admin\PeminjamanController as AdminPeminjamanController;
use App\Http\Controllers\Pengguna\DaftarAlatController;
use App\Http\Controllers\Pengguna\PeminjamanController as PenggunaPeminjamanController;
use App\Http\Controllers\Pengguna\PengembalianController;
use App\Http\Controllers\Petugas\PeminjamanController as PetugasPeminjamanController;

Route::get('/', function () {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    $role = Auth::user()->account_role ?? 'peminjam';

    $routeName = match ($role) {
        'admin' => 'admin.dashboard',
        'petugas' => 'petugas.dashboard',
        default => 'dashboard',
    };

    return redirect()->intended(route($routeName));
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('role:peminjam')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::get('daftar-alat', [DaftarAlatController::class, 'index'])
            ->name('daftar-alat.index');

        Route::prefix('peminjaman')->name('peminjaman.')->group(function () {
            Route::get('/', [PenggunaPeminjamanController::class, 'index'])
                ->name('index');
            Route::get('daftar-peminjaman', [PenggunaPeminjamanController::class, 'index'])
                ->name('daftar');
            Route::get('riwayat-peminjaman/{loan}', [PenggunaPeminjamanController::class, 'showRiwayat'])
                ->name('riwayat.detail');
            Route::get('riwayat-peminjaman', [PenggunaPeminjamanController::class, 'riwayat'])
                ->name('riwayat');
            Route::get('form', [PenggunaPeminjamanController::class, 'create'])
                ->name('form');
            Route::post('form', [PenggunaPeminjamanController::class, 'store'])
                ->name('form.store');
            Route::get('{loan}/pengembalian', [PengembalianController::class, 'create'])
                ->name('pengembalian.create');
            Route::post('{loan}/pengembalian', [PengembalianController::class, 'store'])
                ->name('pengembalian.store');
        });
    });

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

        Route::prefix('master-data')->name('master-data.')->group(function () {
            Route::prefix('administrator')->name('administrator.')->group(function () {
                Route::get('/', [AdministratorController::class, 'index'])->name('index');
                Route::get('tambah', [AdministratorController::class, 'create'])->name('create');
                Route::post('/', [AdministratorController::class, 'store'])->name('store');
                Route::get('{administrator}/edit', [AdministratorController::class, 'edit'])->name('edit');
                Route::patch('{administrator}', [AdministratorController::class, 'update'])->name('update');
                Route::delete('{administrator}', [AdministratorController::class, 'destroy'])->name('destroy');
                Route::delete('bulk-delete', [AdministratorController::class, 'bulkDestroy'])->name('bulk-destroy');
                Route::patch('bulk-status', [AdministratorController::class, 'bulkUpdateStatus'])->name('bulk-status');
            });
        });

        Route::prefix('peminjaman')->name('peminjaman.')->group(function () {
            Route::get('/', [AdminPeminjamanController::class, 'index'])->name('index');
            Route::get('data', [AdminPeminjamanController::class, 'index'])->name('data.index');
            Route::get('data/tambah', [AdminPeminjamanController::class, 'create'])->name('data.tambah');
            Route::post('data', [AdminPeminjamanController::class, 'store'])->name('data.store');
            Route::patch('data/{loan}', [AdminPeminjamanController::class, 'update'])->name('data.update');
            Route::get('data/{loan}/edit', [AdminPeminjamanController::class, 'edit'])->name('data.edit');
            Route::get('data/{loan}', [AdminPeminjamanController::class, 'show'])->name('data.show');
            Route::get('pengembalian', [AdminPeminjamanController::class, 'pengembalian'])
                ->name('pengembalian.index');
            Route::patch('pengembalian/{pengembalian}/status', [
                AdminPeminjamanController::class,
                'updateReturnStatus',
            ])->name('pengembalian.status');
            Route::patch('pengembalian/bulk-status', [
                AdminPeminjamanController::class,
                'bulkUpdateReturnStatus',
            ])->name('pengembalian.bulk-status');
            Route::delete('pengembalian/{pengembalian}', [
                AdminPeminjamanController::class,
                'destroyReturn',
            ])->name('pengembalian.destroy');
            Route::delete('pengembalian/bulk-delete', [
                AdminPeminjamanController::class,
                'bulkDeleteReturns',
            ])->name('pengembalian.bulk-delete');
            Route::patch('data/{loan}/status', [AdminPeminjamanController::class, 'updateStatus'])->name('data.status');
        });
    });

    Route::middleware('role:petugas')->prefix('petugas')->name('petugas.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::prefix('peminjaman')->name('peminjaman.')->group(function () {
            Route::get('/', [PetugasPeminjamanController::class, 'index'])->name('index');
            Route::patch('{loan}/status', [PetugasPeminjamanController::class, 'updateStatus'])->name('status');
        });
    });
});

require __DIR__ . '/settings.php';
