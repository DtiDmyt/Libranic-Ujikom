<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->intended('/dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:peminjam')->name('dashboard');

    Route::get('admin/dashboard', function () {
        return Inertia::render('admin/dashboard/dashboard');
    })->middleware('role:admin')->name('admin.dashboard');

    Route::get('petugas/dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:petugas')->name('petugas.dashboard');
});

require __DIR__ . '/settings.php';
