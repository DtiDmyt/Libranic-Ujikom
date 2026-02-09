<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $statusFilter = $request->string('status')->toString() ?: 'semua';

        $query = Peminjaman::with(['alat', 'user']);

        if ($statusFilter !== 'semua') {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('nama_peminjam', 'like', '%' . $search . '%')
                    ->orWhereHas('alat', function ($builder) use ($search) {
                        $builder->where('nama_alat', 'like', '%' . $search . '%');
                    });
            });
        }

        $items = $query->latest('created_at')->get()->map(function (Peminjaman $loan) {
            return [
                'id' => $loan->id,
                'nama_barang' => $loan->alat?->nama_alat ?? '-',
                'kelas' => $loan->kelas ?? '-',
                'peminjam' => $loan->nama_peminjam,
                'jumlah' => $loan->jumlah_pinjam,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_pengembalian' => $loan->tanggal_kembali?->toDateString(),
                'status' => $loan->status,
            ];
        });

        $filters = [
            'search' => $search,
            'status' => $statusFilter,
        ];

        $borrowers = Peminjaman::select('nama_peminjam as nama', 'kelas')
            ->distinct()
            ->get()
            ->map(fn($item) => ['nama' => $item->nama, 'kelas' => $item->kelas]);

        $kelasOptions = Peminjaman::distinct()
            ->pluck('kelas')
            ->filter()
            ->values()
            ->all();

        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/daftar-peminjaman', [
            'items' => $items,
            'filters' => $filters,
            'borrowers' => $borrowers,
            'kelasOptions' => $kelasOptions,
        ]);
    }

    public function updateStatus(Request $request, Peminjaman $loan): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:menunggu,disetujui,ditolak'],
            'reason' => ['required_if:status,ditolak', 'string', 'max:500'],
        ]);

        $loan->status = $data['status'];
        $loan->alasan_penolakan = $data['status'] === 'ditolak'
            ? $data['reason']
            : null;
        $loan->save();

        return response()->json(['status' => 'ok']);
    }

    public function create(): Response
    {
        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/tambah-peminjaman', [
            'borrowers' => $this->borrowers(),
            'kelasOptions' => $this->kelasOptions(),
            'defaultDates' => [
                'tanggal_pinjam' => Carbon::today()->toDateString(),
                'tanggal_pengembalian' => Carbon::today()->addDays(7)->toDateString(),
            ],
        ]);
    }

    public function edit(int $loanId): Response
    {
        $loan = $this->sampleLoanById($loanId);

        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/edit-peminjaman', [
            'borrowers' => $this->borrowers(),
            'kelasOptions' => $this->kelasOptions(),
            'loan' => $loan,
        ]);
    }

    public function show(int $loanId): Response
    {
        $loan = $this->sampleLoanDetail($loanId);

        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/detail-peminjaman', [
            'loan' => array_merge($loan, [
                'kode_transaksi' => sprintf('PM-%04d', $loan['id']),
                'status' => 'berjalan',
                'keterangan_pengembalian' => null,
                'lampiran_url' => null,
            ]),
            'history' => $this->extensionHistory(),
        ]);
    }

    private function borrowers(): array
    {
        return [
            ['id' => 1, 'nama' => 'Aldo Wiranata', 'kelas' => 'X PPLG 1'],
            ['id' => 2, 'nama' => 'Naila Ramadhani', 'kelas' => 'XI ANM 2'],
            ['id' => 3, 'nama' => 'Rafi Pratama', 'kelas' => 'XII BCF 1'],
        ];
    }

    private function kelasOptions(): array
    {
        return array_unique(array_column($this->borrowers(), 'kelas'));
    }

    private function sampleLoans(): array
    {
        return [
            [
                'id' => 1,
                'nama_barang' => 'Bor Listrik',
                'peminjam' => 'Aldo Wiranata',
                'peminjam_id' => 1,
                'peminjam_nama' => 'Aldo Wiranata',
                'kelas' => 'X PPLG 1',
                'jumlah' => 2,
                'kondisi_barang' => 'baik',
                'kondisi_pinjam' => 'baik',
                'keterangan_pinjam' => 'Peminjaman untuk praktik modul otomatisasi.',
                'tanggal_pinjam' => Carbon::today()->subDays(3)->toDateString(),
                'tanggal_pengembalian' => Carbon::today()->addDays(4)->toDateString(),
            ],
            [
                'id' => 2,
                'nama_barang' => 'Mesin Las',
                'peminjam' => 'Naila Ramadhani',
                'peminjam_id' => 2,
                'peminjam_nama' => 'Naila Ramadhani',
                'kelas' => 'XI ANM 2',
                'jumlah' => 1,
                'kondisi_barang' => 'rusak',
                'kondisi_pinjam' => 'rusak',
                'keterangan_pinjam' => 'Untuk tugas akhir kecakapan las.',
                'tanggal_pinjam' => Carbon::today()->subDays(5)->toDateString(),
                'tanggal_pengembalian' => Carbon::today()->addDays(2)->toDateString(),
            ],
            [
                'id' => 3,
                'nama_barang' => 'Senter Industri',
                'peminjam' => 'Rafi Pratama',
                'peminjam_id' => 3,
                'peminjam_nama' => 'Rafi Pratama',
                'kelas' => 'XII BCF 1',
                'jumlah' => 3,
                'kondisi_barang' => 'hilang',
                'kondisi_pinjam' => 'hilang',
                'keterangan_pinjam' => 'Pengembalian terlambat dan belum ditemukan.',
                'tanggal_pinjam' => Carbon::today()->subDays(1)->toDateString(),
                'tanggal_pengembalian' => Carbon::today()->addDays(1)->toDateString(),
            ],
        ];
    }

    private function sampleLoanById(int $loanId): array
    {
        $loan = collect($this->sampleLoans())->firstWhere('id', $loanId);

        if (! $loan) {
            abort(404);
        }

        return $loan;
    }

    private function sampleLoanDetail(int $loanId): array
    {
        return $this->sampleLoanById($loanId);
    }

    private function extensionHistory(): array
    {
        return [
            [
                'tanggal' => Carbon::today()->subDays(2)->toIso8601String(),
                'catatan' => 'Perpanjangan satu hari karena ujian',
                'petugas' => 'Admin Susi',
            ],
        ];
    }
}
