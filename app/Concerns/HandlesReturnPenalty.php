<?php

namespace App\Concerns;

use App\Models\Pengembalian;

trait HandlesReturnPenalty
{
    protected function syncReturnPenalty(Pengembalian $pengembalian): void
    {
        $pengembalian->loadMissing('peminjaman', 'peminjaman.alat');

        $loan = $pengembalian->peminjaman;

        $shouldReset = $pengembalian->status !== 'telat'
            || ! $loan
            || ! $loan->tanggal_kembali
            || ! $pengembalian->tanggal_pengembalian
            || $pengembalian->tanggal_pengembalian->lessThanOrEqualTo($loan->tanggal_kembali);

        if ($shouldReset) {
            if ($pengembalian->telat_hari !== null || $pengembalian->total_denda !== null) {
                $pengembalian->forceFill([
                    'telat_hari' => null,
                    'total_denda' => null,
                ])->save();
            }

            return;
        }

        $lateDays = $loan->tanggal_kembali->diffInDays($pengembalian->tanggal_pengembalian);
        $perDayFine = (int) ($loan->denda_per_hari ?? 0);
        if ($perDayFine <= 0) {
            $perDayFine = (int) ($loan->alat?->denda_keterlambatan ?? 0);
        }
        $totalFine = $lateDays * $perDayFine;

        if ($pengembalian->telat_hari === $lateDays && $pengembalian->total_denda === $totalFine) {
            return;
        }

        $pengembalian->forceFill([
            'telat_hari' => $lateDays,
            'total_denda' => $totalFine,
        ])->save();
    }
}
