<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('petugas/dashboard/dashboard', [
            'quickStats' => $this->resolveQuickStats(),
        ]);
    }

    private function resolveQuickStats(): array
    {
        $today = Carbon::today();

        $pendingLoans = Peminjaman::where('status', 'menunggu')->count();
        $todayLoans = Peminjaman::whereDate('tanggal_pinjam', $today)->count();

        $returnsToday = Pengembalian::with('peminjaman:id,denda_per_hari,tanggal_kembali')
            ->whereDate('tanggal_pengembalian', $today)
            ->get();

        $todayReturns = $returnsToday->count();
        $todayFine = $returnsToday->sum(function (Pengembalian $pengembalian) {
            $loan = $pengembalian->peminjaman;

            if (! $loan || ! $loan->tanggal_kembali || ! $pengembalian->tanggal_pengembalian) {
                return 0;
            }

            $lateDays = max(0, $pengembalian->tanggal_pengembalian->diffInDays($loan->tanggal_kembali, false));

            return $lateDays * ($loan->denda_per_hari ?? 0);
        });

        return compact('pendingLoans', 'todayLoans', 'todayReturns', 'todayFine');
    }
}
