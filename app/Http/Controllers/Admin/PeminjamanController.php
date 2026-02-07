<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    public function index(Request $request): Response
    {
        $items = $this->sampleLoans();

        $filters = [
            'search' => $request->string('search')->toString(),
            'kondisi' => $request->string('kondisi')->toString() ?: 'semua',
            'kelas' => $request->string('kelas')->toString() ?: 'semua',
        ];

        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/daftar-peminjaman', [
            'items' => $items,
            'filters' => $filters,
            'borrowers' => $this->borrowers(),
            'kelasOptions' => $this->kelasOptions(),
        ]);
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
