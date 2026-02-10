<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    private const STATUS_OPTIONS = [
        ['value' => 'semua', 'label' => 'Semua Status'],
        ['value' => 'tepat waktu', 'label' => 'Tepat Waktu'],
        ['value' => 'telat', 'label' => 'Terlambat'],
        ['value' => 'rusak', 'label' => 'Rusak'],
        ['value' => 'hilang', 'label' => 'Hilang'],
    ];

    private const DEFAULT_JURUSAN = ['PPLG', 'ANM', 'BCF', 'TO', 'TPFL'];

    public function index(Request $request): Response
    {
        $filters = $this->normalizeFilters($request);
        [$startDate, $endDate] = $this->resolvePeriod($filters['month']);

        $loanQuery = $this->applyLoanFilters(
            Peminjaman::query(),
            $startDate,
            $endDate,
            $filters['jurusan'],
            $filters['status']
        );

        $returnQuery = $this->applyReturnFilters(
            Pengembalian::query()->with(['peminjaman.alat']),
            $startDate,
            $endDate,
            $filters['jurusan'],
            $filters['status']
        );

        $summary = [
            'total_loans' => (clone $loanQuery)->count(),
            'total_returns' => (clone $returnQuery)->count(),
            'on_time' => (clone $returnQuery)->where('status', 'tepat waktu')->count(),
            'late' => (clone $returnQuery)->where('status', 'telat')->count(),
            'problematic' => (clone $returnQuery)->whereIn('status', ['rusak', 'hilang'])->count(),
        ];

        $chartData = $this->buildChartData($loanQuery);

        $highlights = [
            $this->resolvePopularItem($startDate, $endDate, $filters['jurusan'], $filters['status']),
            $this->resolveMostLateBorrower($startDate, $endDate, $filters['jurusan'], $filters['status']),
            $this->resolveProblematicItem($startDate, $endDate, $filters['jurusan'], $filters['status']),
        ];

        $table = (clone $returnQuery)
            ->orderByDesc('tanggal_pengembalian')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Pengembalian $return) {
                $loan = $return->peminjaman;

                return [
                    'id' => $return->id,
                    'nama_barang' => $loan?->alat?->nama_alat ?? '-',
                    'jurusan' => $loan?->kelas ?? '-',
                    'peminjam' => $loan?->nama_peminjam ?? '-',
                    'tanggal_pinjam' => $loan?->tanggal_pinjam?->toDateString(),
                    'tanggal_kembali' => $return->tanggal_pengembalian?->toDateString()
                        ?? $loan?->tanggal_kembali?->toDateString(),
                    'status' => $return->status ?? 'menunggu',
                    'keterangan' => $return->catatan ?? '-',
                ];
            });

        $jurusanOptions = Peminjaman::query()
            ->select('kelas')
            ->whereNotNull('kelas')
            ->distinct()
            ->orderBy('kelas')
            ->pluck('kelas')
            ->filter()
            ->values()
            ->all();

        return Inertia::render('petugas/laporan/laporan', [
            'summary' => $summary,
            'chart' => [
                'jurusan' => $chartData,
            ],
            'highlights' => $highlights,
            'table' => $table,
            'filters' => $filters,
            'filterOptions' => [
                'jurusan' => $jurusanOptions,
                'status' => self::STATUS_OPTIONS,
            ],
        ]);
    }

    private function normalizeFilters(Request $request): array
    {
        $month = $request->string('month')->toString();
        $jurusan = trim($request->string('jurusan')->toString());
        $status = strtolower(trim($request->string('status')->toString()));

        $allowedStatuses = collect(self::STATUS_OPTIONS)
            ->pluck('value')
            ->filter(fn($value) => $value !== 'semua')
            ->all();

        if ($status === '' || ($status !== 'semua' && ! in_array($status, $allowedStatuses, true))) {
            $status = 'semua';
        }

        return [
            'month' => $month,
            'jurusan' => $jurusan,
            'status' => $status,
        ];
    }

    private function resolvePeriod(?string $month): array
    {
        if (! $month) {
            return [null, null];
        }

        try {
            $start = CarbonImmutable::createFromFormat('Y-m', $month)->startOfMonth();
            return [$start, $start->endOfMonth()];
        } catch (\Throwable $exception) {
            return [null, null];
        }
    }

    private function applyLoanFilters(
        Builder $query,
        ?CarbonImmutable $startDate,
        ?CarbonImmutable $endDate,
        string $jurusan,
        string $status
    ): Builder {
        return $query
            ->when($startDate && $endDate, fn(Builder $builder) => $builder->whereBetween('tanggal_pinjam', [$startDate, $endDate]))
            ->when($jurusan !== '', fn(Builder $builder) => $builder->where('kelas', $jurusan))
            ->when(
                $status !== 'semua',
                fn(Builder $builder) => $builder->whereHas('pengembalian', fn(Builder $return) => $return->where('status', $status))
            );
    }

    private function applyReturnFilters(
        Builder $query,
        ?CarbonImmutable $startDate,
        ?CarbonImmutable $endDate,
        string $jurusan,
        string $status
    ): Builder {
        return $query
            ->when($status !== 'semua', fn(Builder $builder) => $builder->where('status', $status))
            ->whereHas('peminjaman', function (Builder $loan) use ($startDate, $endDate, $jurusan) {
                if ($startDate && $endDate) {
                    $loan->whereBetween('tanggal_pinjam', [$startDate, $endDate]);
                }

                if ($jurusan !== '') {
                    $loan->where('kelas', $jurusan);
                }
            });
    }

    private function buildChartData(Builder $loanQuery): Collection
    {
        $raw = (clone $loanQuery)
            ->leftJoin('pengembalian as returns', 'returns.peminjaman_id', '=', 'peminjaman.id')
            ->selectRaw('COALESCE(peminjaman.kelas, "Umum") as kelas')
            ->selectRaw('COUNT(peminjaman.id) as total_peminjaman')
            ->selectRaw('SUM(CASE WHEN returns.id IS NOT NULL THEN 1 ELSE 0 END) as total_pengembalian')
            ->selectRaw('SUM(CASE WHEN returns.status = "telat" THEN 1 ELSE 0 END) as total_telat')
            ->groupBy('kelas')
            ->get();

        $grouped = $raw->groupBy(fn($row) => $this->normalizeJurusan($row->kelas))
            ->map(function (Collection $rows) {
                return [
                    'peminjaman' => $rows->sum('total_peminjaman'),
                    'pengembalian' => $rows->sum('total_pengembalian'),
                    'telat' => $rows->sum('total_telat'),
                ];
            });

        $orderedLabels = collect(self::DEFAULT_JURUSAN)
            ->merge($grouped->keys()->diff(self::DEFAULT_JURUSAN))
            ->unique()
            ->values();

        return $orderedLabels->map(function (string $label) use ($grouped) {
            $payload = $grouped->get($label, ['peminjaman' => 0, 'pengembalian' => 0, 'telat' => 0]);

            return [
                'name' => $label,
                'peminjaman' => (int) $payload['peminjaman'],
                'pengembalian' => (int) $payload['pengembalian'],
                'telat' => (int) $payload['telat'],
            ];
        });
    }

    private function normalizeJurusan(?string $kelas): string
    {
        if (! $kelas) {
            return 'Umum';
        }

        $parts = preg_split('/\s+/', strtoupper(trim($kelas)));
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

        return strtoupper($parts[0] ?? 'UMUM');
    }

    private function resolvePopularItem(
        ?CarbonImmutable $startDate,
        ?CarbonImmutable $endDate,
        string $jurusan,
        string $status
    ): array {
        $query = $this->applyLoanFilters(
            Peminjaman::query()->leftJoin('daftarbarang as alat', 'alat.id', '=', 'peminjaman.daftarbarang_id'),
            $startDate,
            $endDate,
            $jurusan,
            $status
        );

        $record = $query
            ->selectRaw('COALESCE(alat.nama_alat, "Tanpa Nama") as nama_barang')
            ->selectRaw('COUNT(peminjaman.id) as total')
            ->groupBy('nama_barang')
            ->orderByDesc('total')
            ->first();

        if (! $record) {
            return [
                'label' => 'Barang paling sering dipinjam',
                'value' => 'Belum ada data',
                'meta' => null,
            ];
        }

        return [
            'label' => 'Barang paling sering dipinjam',
            'value' => $record->nama_barang,
            'meta' => sprintf('%dx dipinjam', (int) $record->total),
        ];
    }

    private function resolveMostLateBorrower(
        ?CarbonImmutable $startDate,
        ?CarbonImmutable $endDate,
        string $jurusan,
        string $status
    ): array {
        $query = Pengembalian::query()
            ->join('peminjaman as loans', 'loans.id', '=', 'pengembalian.peminjaman_id');

        if ($startDate && $endDate) {
            $query->whereBetween('loans.tanggal_pinjam', [$startDate, $endDate]);
        }

        if ($jurusan !== '') {
            $query->where('loans.kelas', $jurusan);
        }

        if ($status !== 'semua') {
            $query->where('pengembalian.status', $status);
        }

        $record = $query
            ->where('pengembalian.status', 'telat')
            ->selectRaw('COALESCE(loans.nama_peminjam, "-") as nama_peminjam')
            ->selectRaw('COALESCE(loans.kelas, "-") as kelas')
            ->selectRaw('COUNT(pengembalian.id) as total')
            ->groupBy('nama_peminjam', 'kelas')
            ->orderByDesc('total')
            ->first();

        if (! $record) {
            return [
                'label' => 'Siswa paling sering telat',
                'value' => 'Belum ada data',
                'meta' => null,
            ];
        }

        $meta = $record->kelas !== '-' ? sprintf('%s · %dx telat', $record->kelas, (int) $record->total)
            : sprintf('%dx telat', (int) $record->total);

        return [
            'label' => 'Siswa paling sering telat',
            'value' => $record->nama_peminjam,
            'meta' => $meta,
        ];
    }

    private function resolveProblematicItem(
        ?CarbonImmutable $startDate,
        ?CarbonImmutable $endDate,
        string $jurusan,
        string $status
    ): array {
        $query = Pengembalian::query()
            ->join('peminjaman as loans', 'loans.id', '=', 'pengembalian.peminjaman_id')
            ->leftJoin('daftarbarang as alat', 'alat.id', '=', 'loans.daftarbarang_id');

        if ($startDate && $endDate) {
            $query->whereBetween('loans.tanggal_pinjam', [$startDate, $endDate]);
        }

        if ($jurusan !== '') {
            $query->where('loans.kelas', $jurusan);
        }

        if ($status !== 'semua') {
            $query->where('pengembalian.status', $status);
        }

        $record = $query
            ->whereIn('pengembalian.status', ['rusak', 'hilang'])
            ->selectRaw('COALESCE(alat.nama_alat, "Tanpa Nama") as nama_barang')
            ->selectRaw('COUNT(pengembalian.id) as total')
            ->groupBy('nama_barang')
            ->orderByDesc('total')
            ->first();

        if (! $record) {
            return [
                'label' => 'Barang paling sering bermasalah',
                'value' => 'Belum ada data',
                'meta' => null,
            ];
        }

        return [
            'label' => 'Barang paling sering bermasalah',
            'value' => $record->nama_barang,
            'meta' => sprintf('%dx kasus', (int) $record->total),
        ];
    }
}
