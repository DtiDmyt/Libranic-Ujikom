<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DaftarBarang;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const DEFAULT_CATEGORIES = ['GURU', 'PPLG', 'ANM', 'BCF', 'TO', 'TPFL', 'LAINNYA'];

    public function index(): Response
    {
        $quickStats = $this->resolveQuickStats();
        $jurusanStats = $this->resolveJurusanStats();

        $peakJurusan = $jurusanStats
            ->sortByDesc('peminjaman')
            ->first() ?? $this->fallbackJurusan();

        $highestLate = $jurusanStats
            ->sortByDesc('terlambat')
            ->first() ?? $this->fallbackJurusan();

        return Inertia::render('admin/dashboard/dashboard', [
            'quickStats' => $quickStats,
            'jurusanStats' => $jurusanStats->values()->all(),
            'peakJurusan' => $peakJurusan,
            'highestLate' => $highestLate,
        ]);
    }

    private function resolveQuickStats(): array
    {
        $totalAlat = DaftarBarang::count();
        $peminjamanAktif = Peminjaman::doesntHave('pengembalian')->count();
        $problematicItems = Pengembalian::whereIn('status', ['rusak', 'hilang'])->count();
        $totalDenda = $this->resolveTotalDendaForCurrentMonth();

        return compact('totalAlat', 'peminjamanAktif', 'problematicItems', 'totalDenda');
    }

    private function resolveTotalDendaForCurrentMonth(): int
    {
        $period = Carbon::now();

        return Pengembalian::with([
            'peminjaman:id,denda_per_hari,tanggal_kembali,daftarbarang_id',
            'peminjaman.alat:id,denda_keterlambatan',
        ])
            ->whereYear('tanggal_pengembalian', $period->year)
            ->whereMonth('tanggal_pengembalian', $period->month)
            ->get()
            ->sum(function (Pengembalian $pengembalian) {
                if ($pengembalian->total_denda !== null) {
                    return (int) $pengembalian->total_denda;
                }

                $loan = $pengembalian->peminjaman;

                if (
                    ! $loan
                    || ! $loan->tanggal_kembali
                    || ! $pengembalian->tanggal_pengembalian
                    || $pengembalian->tanggal_pengembalian->lessThanOrEqualTo($loan->tanggal_kembali)
                ) {
                    return 0;
                }

                $lateDays = $loan->tanggal_kembali->diffInDays($pengembalian->tanggal_pengembalian);
                $perDayFine = (int) ($loan->denda_per_hari ?? 0);

                if ($perDayFine <= 0) {
                    $perDayFine = (int) ($loan->alat?->denda_keterlambatan ?? 0);
                }

                return $lateDays * $perDayFine;
            });
    }

    private function resolveJurusanStats(): Collection
    {
        $loans = Peminjaman::query()
            ->with(['pengembalian:id,peminjaman_id,status', 'user:id,role,kelas'])
            ->get(['kelas', 'id']);

        $grouped = $loans
            ->groupBy(fn(Peminjaman $loan) => $this->resolveCategory($loan))
            ->map(fn(Collection $items) => [
                'peminjaman' => $items->count(),
                'terlambat' => $items->filter(fn(Peminjaman $loan) => $loan->pengembalian?->status === 'telat')->count(),
            ]);

        $ordered = collect(self::DEFAULT_CATEGORIES)
            ->merge($grouped->keys()->diff(self::DEFAULT_CATEGORIES))
            ->unique()
            ->values();

        return $ordered->map(function (string $label) use ($grouped) {
            $payload = $grouped->get($label, [
                'peminjaman' => 0,
                'terlambat' => 0,
            ]);

            return [
                'name' => $label,
                'peminjaman' => (int) $payload['peminjaman'],
                'terlambat' => (int) $payload['terlambat'],
            ];
        });
    }

    private function fallbackJurusan(): array
    {
        $defaultLabel = self::DEFAULT_CATEGORIES[0];

        return [
            'name' => $defaultLabel,
            'peminjaman' => 0,
            'terlambat' => 0,
        ];
    }

    private function resolveCategory(Peminjaman $loan): string
    {
        $userRole = strtolower(trim((string) ($loan->user?->role ?? '')));

        if ($userRole === 'guru') {
            return 'GURU';
        }

        $kelas = strtoupper(trim((string) ($loan->kelas ?: $loan->user?->kelas ?: '')));

        if ($kelas === '') {
            return 'LAINNYA';
        }

        $parts = preg_split('/\s+/', $kelas);

        if (! $parts) {
            return 'LAINNYA';
        }

        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }

            if (in_array($part, self::DEFAULT_CATEGORIES, true)) {
                return $part;
            }

            if (preg_match('/^[A-Z]{2,}$/', $part)) {
                return in_array($part, self::DEFAULT_CATEGORIES, true) ? $part : 'LAINNYA';
            }
        }

        return 'LAINNYA';
    }
}
