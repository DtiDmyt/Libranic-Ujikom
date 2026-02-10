<?php

namespace App\Http\Controllers\Pengguna;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const MAX_ACTIVE_LOANS = 2;

    public function index(): Response
    {
        $today = Carbon::today();

        $activeLoans = Peminjaman::with('alat')
            ->where('user_id', Auth::id())
            ->where('status', 'disetujui')
            ->doesntHave('pengembalian')
            ->orderByDesc('tanggal_pinjam')
            ->get();

        $activeLoansPayload = $activeLoans
            ->map(function (Peminjaman $loan) use ($today) {
                $dueDate = $loan->tanggal_kembali;
                $isLate = $dueDate && $today->greaterThan($dueDate);
                $lateDays = $isLate ? $today->diffInDays($dueDate) : 0;
                $penaltyPerDay = $loan->denda_per_hari ?? 0;
                $latePenaltyTotal = $lateDays * $penaltyPerDay;

                $dueMessage = $dueDate
                    ? ($isLate
                        ? "Telat {$lateDays} hari"
                        : "Harus kembali paling lambat {$dueDate->format('d M Y')}")
                    : 'Belum ada tanggal kembali';

                $keterangan = $lateDays > 0
                    ? "Telat {$lateDays} hari · Denda " . number_format($latePenaltyTotal, 0, ',', '.') . " (Rp " . number_format($penaltyPerDay, 0, ',', '.') . '/hari)' : 'Dalam tenggat waktu pengembalian';

                return [
                    'id' => $loan->id,
                    'nama_barang' => $loan->alat?->nama_alat ?? 'Alat tidak diketahui',
                    'jumlah' => $loan->jumlah_pinjam,
                    'tanggal_pinjam' => $loan->tanggal_pinjam?->format('d M Y'),
                    'tanggal_kembali' => $dueDate?->format('d M Y'),
                    'late_days' => $lateDays,
                    'late_penalty_per_day' => $penaltyPerDay,
                    'late_penalty_total' => $latePenaltyTotal,
                    'due_message' => $dueMessage,
                    'isLate' => $isLate,
                    'keterangan' => $keterangan,
                ];
            })
            ->values()
            ->all();

        $totalBorrows = Peminjaman::where('user_id', Auth::id())->count();

        return Inertia::render('pengguna/dashboard/dashboard', [
            'totalBorrows' => $totalBorrows,
            'maxActiveLoans' => self::MAX_ACTIVE_LOANS,
            'activeLoans' => $activeLoansPayload,
        ]);
    }
}
