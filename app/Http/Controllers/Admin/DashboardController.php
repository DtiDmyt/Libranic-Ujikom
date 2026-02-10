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
    private const DEFAULT_JURUSAN = ['PPLG', 'ANM', 'BCF', 'TO', 'TPFL'];

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

        return Pengembalian::with('peminjaman:id,denda_per_hari,tanggal_kembali')
            ->whereYear('tanggal_pengembalian', $period->year)
            ->whereMonth('tanggal_pengembalian', $period->month)
            ->get()
            ->sum(function (Pengembalian $pengembalian) {
                $loan = $pengembalian->peminjaman;

                if (! $loan || ! $loan->tanggal_kembali || ! $pengembalian->tanggal_pengembalian) {
                    return 0;
                }

                $lateDays = max(0, $pengembalian->tanggal_pengembalian->diffInDays($loan->tanggal_kembali, false));

                return $lateDays * ($loan->denda_per_hari ?? 0);
            });
    }

    private function resolveJurusanStats(): Collection
    {
        $loans = Peminjaman::query()
            ->with('pengembalian:id,peminjaman_id,status')
            ->get(['kelas', 'id']);

        $grouped = $loans
            ->groupBy(fn(Peminjaman $loan) => $this->normalizeJurusan($loan->kelas))
            ->map(fn(Collection $items) => [
                'peminjaman' => $items->count(),
                'terlambat' => $items->filter(fn(Peminjaman $loan) => $loan->pengembalian?->status === 'telat')->count(),
            ]);

        $ordered = collect(self::DEFAULT_JURUSAN)
            ->merge($grouped->keys()->diff(self::DEFAULT_JURUSAN))
            ->unique()
            ->values()
            ->filter(fn(string $label) => $label !== 'UMUM');

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
        $defaultLabel = self::DEFAULT_JURUSAN[0];

        return [
            'name' => $defaultLabel,
            'peminjaman' => 0,
            'terlambat' => 0,
        ];
    }

    private function normalizeJurusan(?string $kelas): string
    {
        if (! $kelas) {
            return 'UMUM';
        }

        $parts = preg_split('/\s+/', strtoupper(trim($kelas)));

        if (! $parts) {
            return 'UMUM';
        }

        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }

            if (in_array($part, self::DEFAULT_JURUSAN, true)) {
                return $part;
            }

            if (preg_match('/^[A-Z]{2,}$/', $part)) {
                return $part;
            }
        }

        return strtoupper($parts[0]) ?: 'UMUM';
    }
}
