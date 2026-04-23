<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AdministratorController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DaftarBarangController;
use App\Http\Controllers\Admin\KategoriAlatController;
use App\Http\Controllers\Admin\LogAktivitasController;
use App\Http\Controllers\Admin\PengembalianController as AdminPengembalianController;
use App\Http\Controllers\Admin\PeminjamanController as AdminPeminjamanController;
use App\Http\Controllers\Pengguna\DaftarAlatController;
use App\Http\Controllers\Pengguna\DashboardController as PenggunaDashboardController;
use App\Http\Controllers\Pengguna\PeminjamanController as PenggunaPeminjamanController;
use App\Http\Controllers\Pengguna\PengembalianController;

Route::get('/', function () {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    $role = Auth::user()->account_role ?? 'peminjam';

    $routeName = match ($role) {
        'admin' => 'admin.dashboard',
        default => 'dashboard',
    };

    return redirect()->intended(route($routeName));
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('role:peminjam')->group(function () {
        Route::get('dashboard', [PenggunaDashboardController::class, 'index'])->name('dashboard');

        Route::get('daftar-buku', [DaftarAlatController::class, 'index'])->name('daftar-buku.index');

        Route::prefix('peminjaman')->name('peminjaman.')->group(function () {
            Route::get('/', [PenggunaPeminjamanController::class, 'index'])->name('index');
            Route::get('daftar-peminjaman', [PenggunaPeminjamanController::class, 'index'])->name('daftar');
            Route::get('form', [PenggunaPeminjamanController::class, 'create'])->name('form');
            Route::post('form', [PenggunaPeminjamanController::class, 'store'])->name('form.store');
            Route::get('riwayat-peminjaman/{loan}', [PenggunaPeminjamanController::class, 'showRiwayat'])->name('riwayat.detail');
            Route::get('riwayat-peminjaman', [PenggunaPeminjamanController::class, 'riwayat'])->name('riwayat');
            Route::get('{loan}', [PenggunaPeminjamanController::class, 'show'])->name('detail');
            Route::get('{loan}/edit', [PenggunaPeminjamanController::class, 'edit'])->name('edit');
            Route::patch('{loan}', [PenggunaPeminjamanController::class, 'update'])->name('update');
            Route::delete('{loan}', [PenggunaPeminjamanController::class, 'destroy'])->name('destroy');
            Route::get('{loan}/pengembalian', [PengembalianController::class, 'create'])->name('pengembalian.create');
            Route::post('{loan}/pengembalian', [PengembalianController::class, 'store'])->name('pengembalian.store');
        });
    });

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('log-aktivitas', [LogAktivitasController::class, 'index'])->name('log-aktivitas.index');

        Route::get('buku/kategori', [KategoriAlatController::class, 'index'])->name('kategori.index');
        Route::post('buku/kategori', [KategoriAlatController::class, 'store'])->name('kategori.store');
        Route::patch('buku/kategori/{kategoriAlat}', [KategoriAlatController::class, 'update'])->name('kategori.update');
        Route::delete('buku/kategori/bulk-delete', [KategoriAlatController::class, 'bulkDestroy'])->name('kategori.bulk-destroy');

        Route::prefix('buku')->name('buku.')->group(function () {
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

        Route::prefix('data-peminjaman')->name('data-peminjaman.')->group(function () {
            Route::get('peminjaman', [AdminPeminjamanController::class, 'index'])->name('peminjaman.index');
            Route::get('peminjaman/tambah', [AdminPeminjamanController::class, 'create'])->name('peminjaman.tambah');
            Route::post('peminjaman', [AdminPeminjamanController::class, 'store'])->name('peminjaman.store');
            Route::patch('peminjaman/{loan}', [AdminPeminjamanController::class, 'update'])->name('peminjaman.update');
            Route::delete('peminjaman/{loan}', [AdminPeminjamanController::class, 'destroy'])->name('peminjaman.destroy');
            Route::get('peminjaman/{loan}/edit', [AdminPeminjamanController::class, 'edit'])->name('peminjaman.edit');
            Route::get('peminjaman/{loan}', [AdminPeminjamanController::class, 'show'])->name('peminjaman.show');
            Route::patch('peminjaman/{loan}/status', [AdminPeminjamanController::class, 'updateStatus'])->name('peminjaman.status');
            Route::delete('peminjaman/bulk-delete', [AdminPeminjamanController::class, 'bulkDestroy'])->name('peminjaman.bulk-delete');
            Route::patch('peminjaman/bulk-selesai', [AdminPeminjamanController::class, 'bulkComplete'])->name('peminjaman.bulk-complete');
        });

        Route::prefix('data-pengembalian')->name('data-pengembalian.')->group(function () {
            Route::get('pengembalian', [AdminPengembalianController::class, 'index'])->name('pengembalian.index');
            Route::get('pengembalian/tambah', [AdminPengembalianController::class, 'create'])->name('pengembalian.tambah');
            Route::post('pengembalian', [AdminPengembalianController::class, 'store'])->name('pengembalian.store');
            Route::get('pengembalian/{pengembalian}/edit', [AdminPengembalianController::class, 'edit'])->name('pengembalian.edit');
            Route::patch('pengembalian/{pengembalian}', [AdminPengembalianController::class, 'update'])->name('pengembalian.update');
            Route::patch('pengembalian/{pengembalian}/status', [
                AdminPengembalianController::class,
                'updateStatus',
            ])->name('pengembalian.status');
            Route::patch('pengembalian/bulk-status', [
                AdminPengembalianController::class,
                'bulkUpdateStatus',
            ])->name('pengembalian.bulk-status');
            Route::delete('pengembalian/{pengembalian}', [
                AdminPengembalianController::class,
                'destroy',
            ])->name('pengembalian.destroy');
            Route::delete('pengembalian/bulk-delete', [
                AdminPengembalianController::class,
                'bulkDestroy',
            ])->name('pengembalian.bulk-delete');
        });

        Route::get('peminjaman/riwayat', [AdminPeminjamanController::class, 'history'])->name('peminjaman.riwayat');

        Route::get('peminjaman', function () {
            return redirect()->route('admin.data-peminjaman.peminjaman.index');
        });
    });
});

require __DIR__ . '/settings.php';
