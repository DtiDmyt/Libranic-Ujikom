<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\DaftarBarang;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $statusFilter = $request->string('status')->toString() ?: 'semua';

        $query = Peminjaman::with(['alat', 'user', 'pengembalian']);

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
            $returnStatus = $loan->pengembalian?->status;
            return [
                'id' => $loan->id,
                'nama_barang' => $loan->alat?->nama_alat ?? '-',
                'kelas' => $loan->kelas ?? '-',
                'peminjam' => $loan->nama_peminjam,
                'jumlah' => $loan->jumlah_pinjam,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_pengembalian' => $loan->tanggal_kembali?->toDateString(),
                'status' => $loan->status,
                'return_status' => $returnStatus,
                'return_status_label' => $this->resolveReturnStatusLabel($returnStatus),
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


    public function create(): Response
    {
        $tools = $this->tools();
        $borrowers = $this->borrowers();

        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/tambah-peminjaman', [
            'borrowers' => $borrowers,
            'kelasOptions' => $this->kelasOptions($borrowers),
            'defaultDates' => [
                'tanggal_pinjam' => Carbon::today()->toDateString(),
                'tanggal_pengembalian' => Carbon::today()->addDays(7)->toDateString(),
            ],
            'tools' => $tools,
            'toolCategories' => $this->toolCategories($tools),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'peminjam_id' => ['required', 'exists:users,id'],
            'daftarbarang_id' => ['required', 'exists:daftarbarang,id'],
            'kategori_alat_id' => ['nullable', 'integer'],
            'kelas' => ['nullable', 'string', 'max:255'],
            'tanggal_pinjam' => ['required', 'date'],
            'tanggal_pengembalian' => ['required', 'date', 'after_or_equal:tanggal_pinjam'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'keterangan_pinjam' => ['required', 'string', 'max:1000'],
        ], [
            'tanggal_pengembalian.after_or_equal' => 'Tanggal pengembalian harus sama atau setelah tanggal pinjam.',
        ]);

        $borrower = User::find($validated['peminjam_id']);
        $tool = DaftarBarang::find($validated['daftarbarang_id']);

        Peminjaman::create([
            'user_id' => $borrower?->id,
            'daftarbarang_id' => $tool?->id,
            'nama_peminjam' => $borrower?->name,
            'nis_nip' => $borrower?->identitas ?? 'ADMIN-' . ($borrower?->id ?? '0'),
            'kelas' => $borrower?->kelas ?? $validated['kelas'],
            'jumlah_pinjam' => (int) $validated['jumlah'],
            'tanggal_pinjam' => $validated['tanggal_pinjam'],
            'tanggal_kembali' => $validated['tanggal_pengembalian'],
            'keperluan' => $validated['keterangan_pinjam'],
            'status' => 'menunggu',
            'denda_per_hari' => $tool?->denda_keterlambatan ?? 0,
        ]);

        return redirect()
            ->route('admin.data-peminjaman.peminjaman.index')
            ->with('success', 'Peminjaman berhasil ditambahkan.');
    }

    public function update(Request $request, Peminjaman $loan): RedirectResponse
    {
        $validated = $request->validate([
            'peminjam_id' => ['required', 'exists:users,id'],
            'daftarbarang_id' => ['required', 'exists:daftarbarang,id'],
            'kategori_alat_id' => ['nullable', 'integer'],
            'kelas' => ['nullable', 'string', 'max:255'],
            'tanggal_pinjam' => ['required', 'date'],
            'tanggal_pengembalian' => ['required', 'date', 'after_or_equal:tanggal_pinjam'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'keterangan_pinjam' => ['required', 'string', 'max:1000'],
        ], [
            'tanggal_pengembalian.after_or_equal' => 'Tanggal pengembalian harus sama atau setelah tanggal pinjam.',
        ]);

        $borrower = User::find($validated['peminjam_id']);
        $tool = DaftarBarang::find($validated['daftarbarang_id']);

        $loan->update([
            'user_id' => $borrower?->id,
            'daftarbarang_id' => $tool?->id,
            'nama_peminjam' => $borrower?->name ?? $loan->nama_peminjam,
            'nis_nip' => $borrower?->identitas ?? $loan->nis_nip,
            'kelas' => $borrower?->kelas ?? $validated['kelas'] ?? $loan->kelas,
            'jumlah_pinjam' => (int) $validated['jumlah'],
            'tanggal_pinjam' => $validated['tanggal_pinjam'],
            'tanggal_kembali' => $validated['tanggal_pengembalian'],
            'keperluan' => $validated['keterangan_pinjam'],
            'denda_per_hari' => $tool?->denda_keterlambatan ?? $loan->denda_per_hari,
        ]);

        return redirect()
            ->route('admin.data-peminjaman.peminjaman.index')
            ->with('success', 'Data peminjaman berhasil diperbarui.');
    }

    public function destroy(Peminjaman $loan): JsonResponse
    {
        $loan->delete();

        return response()->json(['status' => 'ok']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:peminjaman,id'],
        ]);

        Peminjaman::whereIn('id', $data['ids'])->delete();

        return response()->json(['status' => 'ok']);
    }

    public function bulkComplete(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:peminjaman,id'],
        ]);

        Peminjaman::whereIn('id', $data['ids'])->update(['status' => 'disetujui']);

        return response()->json(['status' => 'ok']);
    }

    public function updateStatus(Request $request, Peminjaman $loan): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:menunggu,disetujui,ditolak'],
            'reason' => ['required_if:status,ditolak', 'string', 'max:500'],
        ]);

        $loan->status = $data['status'];
        $loan->alasan_penolakan = $data['status'] === 'ditolak' ? $data['reason'] : null;
        $loan->save();

        $loan->loadMissing(['alat', 'user']);
        $actor = $request->user();
        $actorName = $actor?->name ?? 'Sistem';
        $borrowerName = $loan->nama_peminjam ?? $loan->user?->name ?? 'peminjam';
        $toolName = $loan->alat?->nama_alat ?? 'alat';

        $description = match ($data['status']) {
            'disetujui' => sprintf('menyetujui peminjaman %s untuk %s.', $toolName, $borrowerName),
            'ditolak' => sprintf('menolak peminjaman %s milik %s.', $toolName, $borrowerName),
            default => sprintf('memperbarui status peminjaman %s milik %s.', $toolName, $borrowerName),
        };

        ActivityLog::record(
            $actor?->id,
            $description,
            [
                'context' => 'persetujuan_admin',
                'loan_id' => $loan->id,
                'alat_id' => $loan->alat?->id,
                'alat_nama' => $toolName,
                'target_user_id' => $loan->user_id,
                'target_user_name' => $borrowerName,
                'status' => $data['status'],
                'reason' => $loan->alasan_penolakan,
            ]
        );

        return response()->json(['status' => 'ok']);
    }

    public function edit(int $loanId): Response
    {
        $loan = Peminjaman::with(['alat.kategoriAlat', 'user'])->findOrFail($loanId);
        $tools = $this->tools();
        $borrowers = $this->borrowers();

        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/edit-peminjaman', [
            'borrowers' => $borrowers,
            'kelasOptions' => $this->kelasOptions($borrowers),
            'loan' => $this->formatLoanForForm($loan),
            'tools' => $tools,
            'toolCategories' => $this->toolCategories($tools),
        ]);
    }

    public function show(int $loanId): Response
    {
        $loan = Peminjaman::with(['alat.kategoriAlat', 'user'])->findOrFail($loanId);

        return Inertia::render('admin/manajamen-peminjaman/data-peminjaman/detail-peminjaman', [
            'loan' => $this->formatLoanForDetail($loan),
            'history' => $this->extensionHistory(),
        ]);
    }

    public function history(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $statusFilter = $request->string('status')->toString() ?: 'semua';

        $query = Pengembalian::with(['peminjaman.alat'])
            ->whereNotNull('tanggal_pengembalian')
            ->whereIn('status', ['tepat waktu', 'telat', 'rusak', 'hilang']);

        if ($statusFilter !== 'semua') {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->whereHas('peminjaman', function ($loanQuery) use ($search) {
                    $loanQuery->where('nama_peminjam', 'like', '%' . $search . '%')
                        ->orWhereHas('alat', function ($toolQuery) use ($search) {
                            $toolQuery->where('nama_alat', 'like', '%' . $search . '%');
                        });
                });
            });
        }

        $items = $query->orderByDesc('tanggal_pengembalian')
            ->get()
            ->map(function (Pengembalian $return) {
                $loan = $return->peminjaman;
                $tool = $loan?->alat;

                return [
                    'id' => $return->id,
                    'loan_id' => $loan?->id,
                    'nama_barang' => $tool?->nama_alat ?? '-',
                    'peminjam' => $loan?->nama_peminjam ?? '-',
                    'kelas' => $loan?->kelas ?? '-',
                    'jumlah' => $loan?->jumlah_pinjam ?? 0,
                    'tanggal_pinjam' => $loan?->tanggal_pinjam?->toDateString(),
                    'batas_pengembalian' => $loan?->tanggal_kembali?->toDateString(),
                    'tanggal_pengembalian' => $return->tanggal_pengembalian?->toDateString(),
                    'status' => $return->status ?? 'menunggu',
                    'status_barang' => $return->kondisi ?? 'baik',
                    'lampiran_url' => $return->lampiran_path
                        ? Storage::url($return->lampiran_path)
                        : null,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('admin/manajamen-peminjaman/riwayat-peminjaman/riwayat-peminjaman', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    private function borrowers(): array
    {
        $users = User::select('id', 'name', 'kelas')
            ->orderBy('name')
            ->get();

        if ($users->isNotEmpty()) {
            return $users->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'nama' => $user->name,
                    'kelas' => $user->kelas,
                ];
            })->all();
        }

        return $this->sampleBorrowers();
    }

    private function kelasOptions(?array $borrowers = null): array
    {
        $borrowers = $borrowers ?? $this->borrowers();

        return collect($borrowers)
            ->pluck('kelas')
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function sampleBorrowers(): array
    {
        return [
            ['id' => 1, 'nama' => 'Aldo Wiranata', 'kelas' => 'X PPLG 1'],
            ['id' => 2, 'nama' => 'Naila Ramadhani', 'kelas' => 'XI ANM 2'],
            ['id' => 3, 'nama' => 'Rafi Pratama', 'kelas' => 'XII BCF 1'],
        ];
    }

    private function tools(): array
    {
        $items = DaftarBarang::with('kategoriAlat')
            ->orderBy('nama_alat')
            ->get();

        if ($items->isNotEmpty()) {
            return $items->map(function (DaftarBarang $item) {
                return [
                    'id' => $item->id,
                    'nama' => $item->nama_alat,
                    'kategori_id' => $item->kategori_alat_id ?? 0,
                    'kategori_nama' => $item->kategoriAlat?->nama ?? 'Tanpa Kategori',
                    'kode' => $item->kode_alat ?? sprintf('ALT-%04d', $item->id),
                    'ruangan' => $item->ruangan ?? '-',
                    'stok' => $item->stok ?? 0,
                ];
            })->all();
        }

        return [
            [
                'id' => 101,
                'nama' => 'Bor Listrik',
                'kategori_id' => 11,
                'kategori_nama' => 'Peralatan Bengkel',
                'kode' => 'ALT-PPLG-0001',
                'ruangan' => 'Gudang Utama',
                'stok' => 6,
            ],
            [
                'id' => 102,
                'nama' => 'Mesin Las',
                'kategori_id' => 12,
                'kategori_nama' => 'Peralatan Fabrikasi',
                'kode' => 'ALT-ANM-0102',
                'ruangan' => 'Workshop Las',
                'stok' => 3,
            ],
            [
                'id' => 103,
                'nama' => 'Senter Industri',
                'kategori_id' => 13,
                'kategori_nama' => 'Peralatan Inspeksi',
                'kode' => 'ALT-BCF-0320',
                'ruangan' => 'Lab Inspeksi',
                'stok' => 8,
            ],
        ];
    }

    private function toolCategories(?array $tools = null): array
    {
        $tools = $tools ?? $this->tools();

        return collect($tools)
            ->map(fn($tool) => [
                'id' => $tool['kategori_id'],
                'nama' => $tool['kategori_nama'],
            ])
            ->unique('id')
            ->values()
            ->all();
    }

    private function formatLoanForForm(Peminjaman $loan): array
    {
        $tool = $loan->alat;
        $category = $tool?->kategoriAlat;

        return [
            'id' => $loan->id,
            'peminjam_id' => $loan->user_id ?? $loan->user?->id ?? 0,
            'peminjam_nama' => $loan->nama_peminjam,
            'kelas' => $loan->kelas ?? '',
            'alat_id' => $tool?->id ?? $loan->daftarbarang_id,
            'alat_nama' => $tool?->nama_alat ?? 'Peralatan',
            'kategori_alat_id' => $tool?->kategori_alat_id,
            'kategori_alat_nama' => $category?->nama ?? 'Tanpa Kategori',
            'kode_alat' => $tool?->kode_alat ?? sprintf('ALT-%04d', (int) ($loan->daftarbarang_id ?? 0)),
            'lokasi_stok' => $tool?->ruangan ?? '-',
            'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString() ?? Carbon::today()->toDateString(),
            'tanggal_pengembalian' => $loan->tanggal_kembali?->toDateString() ?? Carbon::today()->toDateString(),
            'jumlah' => $loan->jumlah_pinjam,
            'kondisi_pinjam' => $this->normalizeCondition($tool?->kondisi_alat),
            'keterangan_pinjam' => $loan->keperluan ?? '',
        ];
    }

    private function formatLoanForDetail(Peminjaman $loan): array
    {
        $tool = $loan->alat;

        return [
            'id' => $loan->id,
            'kode_transaksi' => sprintf('PM-%04d', $loan->id),
            'nama_barang' => $tool?->nama_alat ?? 'Peralatan',
            'peminjam' => $loan->nama_peminjam,
            'kelas' => $loan->kelas ?? '-',
            'jumlah' => $loan->jumlah_pinjam,
            'kondisi_pinjam' => $this->normalizeCondition($tool?->kondisi_alat),
            'kondisi_pengembalian' => null,
            'tanggal_pinjam' => $this->formatDateTimeString($loan->tanggal_pinjam),
            'tanggal_pengembalian' => $this->formatDateTimeString($loan->tanggal_kembali),
            'keterangan_pinjam' => $loan->keperluan ?? '-',
            'keterangan_pengembalian' => $loan->alasan_penolakan,
            'lampiran_url' => null,
            'status' => $this->mapLoanDetailStatus($loan),
        ];
    }

    private function normalizeCondition(?string $value): string
    {
        $normalized = strtolower(trim($value ?? ''));

        return in_array($normalized, ['baik', 'rusak', 'hilang'], true)
            ? $normalized
            : 'baik';
    }

    private function formatDateTimeString(Carbon|CarbonImmutable|null $date): ?string
    {
        if (! $date) {
            return null;
        }

        return $date->copy()->startOfDay()->toIso8601String();
    }

    private function mapLoanDetailStatus(Peminjaman $loan): string
    {
        if ($loan->status === 'selesai') {
            return 'selesai';
        }

        if ($loan->status === 'ditolak') {
            return 'selesai';
        }

        if ($loan->tanggal_kembali instanceof Carbon && $loan->tanggal_kembali->isPast()) {
            return 'telat';
        }

        return 'berjalan';
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

    private function resolveReturnStatusLabel(?string $status): ?string
    {
        return match ($status) {
            'tepat waktu' => 'Tepat Waktu',
            'telat' => 'Telat',
            'rusak' => 'Rusak',
            'hilang' => 'Hilang',
            default => null,
        };
    }
}
