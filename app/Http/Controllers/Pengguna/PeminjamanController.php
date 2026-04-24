<?php

namespace App\Http\Controllers\Pengguna;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\DaftarBarang;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    private const MAX_EXTENSION_COUNT = 3;
    private const EXTENSION_STEP_DAYS = 7;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->string('search')->toString();
        $statusFilter = $request->string('status')->toString() ?: 'semua';

        $allowedStatuses = ['menunggu', 'disetujui'];
        $query = Peminjaman::with('alat')
            ->where('user_id', $user->id)
            ->whereIn('status', $allowedStatuses);

        if ($statusFilter !== 'semua') {
            $statusFilter = in_array($statusFilter, $allowedStatuses, true)
                ? $statusFilter
                : 'semua';
            if ($statusFilter !== 'semua') {
                $query->where('status', $statusFilter);
            }
        }

        if ($search !== '') {
            $query->whereHas('alat', function (Builder $builder) use ($search) {
                $builder->where('nama_alat', 'like', '%' . $search . '%');
            });
        }

        $items = $query->latest('created_at')->get()->map(function (Peminjaman $loan) {
            $normalizedStatus = $this->normalizeLoanStatus($loan->status);
            $extensionCount = (int) ($loan->perpanjangan_count ?? 0);

            return [
                'id' => $loan->id,
                'nama_alat' => $loan->alat?->nama_alat ?? '-',
                'kode_alat' => $loan->alat?->kode_alat ?? '-',
                'peminjam' => $loan->nama_peminjam ?? '-',
                'kelas' => $loan->kelas ?? '-',
                'jumlah' => $loan->jumlah_pinjam,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
                'keperluan' => $loan->keperluan,
                'status' => $normalizedStatus,
                'denda_per_hari' => $loan->denda_per_hari ?? 0,
                'alasan_penolakan' => $loan->alasan_penolakan,
                'perpanjangan_count' => $extensionCount,
                'max_extensions' => self::MAX_EXTENSION_COUNT,
                'can_extend' => $normalizedStatus === 'disetujui' && $extensionCount < self::MAX_EXTENSION_COUNT,
                'can_delete' => $normalizedStatus === 'menunggu',
                'detail_url' => route('peminjaman.detail', $loan, false),
                'edit_url' => route('peminjaman.edit', $loan, false),
                'update_url' => route('peminjaman.update', $loan, false),
                'delete_url' => route('peminjaman.destroy', $loan, false),
                'return_url' => route('peminjaman.pengembalian.create', $loan, false),
            ];
        })->values()->all();

        $statusOptions = [
            ['value' => 'semua', 'label' => 'Semua Status'],
            ['value' => 'menunggu', 'label' => 'Menunggu Persetujuan'],
            ['value' => 'disetujui', 'label' => 'Disetujui'],
        ];

        return Inertia::render('pengguna/peminjaman/daftar-peminjaman', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            'statusOptions' => $statusOptions,
            'maxExtensions' => self::MAX_EXTENSION_COUNT,
        ]);
    }

    public function show(Request $request, Peminjaman $loan): Response
    {
        $this->authorizeLoanOwner($request, $loan);

        return Inertia::render('pengguna/peminjaman/detail-peminjaman', [
            'loan' => $this->loanPayload($loan),
        ]);
    }

    public function edit(Request $request, Peminjaman $loan): Response
    {
        $this->authorizeLoanOwner($request, $loan);

        abort_unless($this->canExtendLoan($loan), 403);

        return Inertia::render('pengguna/peminjaman/edit-peminjaman', [
            'loan' => $this->loanPayload($loan),
        ]);
    }

    public function update(Request $request, Peminjaman $loan): RedirectResponse
    {
        $this->authorizeLoanOwner($request, $loan);
        $loan->loadMissing('alat');

        if (!$this->canExtendLoan($loan)) {
            return Redirect::back()
                ->withErrors([
                    'tanggal_pengembalian' => 'Kamu hanya bisa memperpanjang peminjaman yang sudah disetujui sampai maksimal 3x.',
                ])
                ->withInput();
        }

        $currentReturnDate = $loan->tanggal_kembali?->toDateString();
        if ($currentReturnDate === null) {
            return Redirect::back()
                ->withErrors([
                    'tanggal_pengembalian' => 'Tanggal pengembalian saat ini tidak valid.',
                ])
                ->withInput();
        }

        $newReturnDate = $loan->tanggal_kembali
            ? $loan->tanggal_kembali->copy()->addDays(self::EXTENSION_STEP_DAYS)->toDateString()
            : null;

        if ($newReturnDate === null) {
            return Redirect::back()
                ->withErrors([
                    'tanggal_pengembalian' => 'Tanggal pengembalian baru tidak bisa dihitung.',
                ])
                ->withInput();
        }

        $extensionCount = (int) ($loan->perpanjangan_count ?? 0) + 1;

        $loan->forceFill([
            'tanggal_kembali' => $newReturnDate,
            'perpanjangan_count' => $extensionCount,
        ])->save();

        ActivityLog::record(
            $request->user()?->id,
            sprintf(
                'memperpanjang peminjaman %s selama %d hari sampai %s.',
                $loan->alat?->nama_alat ?? 'alat',
                self::EXTENSION_STEP_DAYS,
                Carbon::parse($newReturnDate)->translatedFormat('d F Y')
            ),
            [
                'context' => 'perpanjangan_peminjaman',
                'loan_id' => $loan->id,
                'alat_id' => $loan->alat?->id,
                'alat_nama' => $loan->alat?->nama_alat,
                'previous_return_date' => $currentReturnDate,
                'new_return_date' => $newReturnDate,
                'perpanjangan_count' => $extensionCount,
                'extension_step_days' => self::EXTENSION_STEP_DAYS,
            ]
        );

        return Redirect::route('peminjaman.daftar')
            ->with('success', 'Peminjaman berhasil diperpanjang 7 hari.');
    }

    public function destroy(Request $request, Peminjaman $loan): JsonResponse
    {
        $this->authorizeLoanOwner($request, $loan);
        $loan->loadMissing('alat');

        if (!$this->isAwaitingApproval($loan->status)) {
            return response()->json([
                'message' => 'km tidak bisa menghapus karena sudah di konfirmasi oleh admin',
            ], 422);
        }

        $tool = $loan->alat;
        $amount = (int) ($loan->jumlah_pinjam ?? 0);

        if ($tool && $amount > 0) {
            $tool->releaseStock($amount);
        }

        ActivityLog::record(
            $request->user()?->id,
            sprintf('membatalkan pengajuan peminjaman %s.', $loan->alat?->nama_alat ?? 'alat'),
            [
                'context' => 'hapus_peminjaman',
                'loan_id' => $loan->id,
                'alat_id' => $loan->alat?->id,
                'alat_nama' => $loan->alat?->nama_alat,
                'jumlah' => $amount,
            ]
        );

        $loan->delete();

        return response()->json(['status' => 'ok']);
    }

    public function create(Request $request): Response
    {
        $user = Auth::user();
        $itemId = (int) ($request->query('alat') ?? $request->query('buku'));
        $item = DaftarBarang::with('kategoriAlat:id,nama')->findOrFail($itemId);
        $isBukuPelajaran = str_contains(
            mb_strtolower((string) ($item->kategoriAlat?->nama ?? ''), 'UTF-8'),
            'pelajaran'
        );

        return Inertia::render('pengguna/peminjaman/form-peminjaman', [
            'borrower' => [
                'nama' => $user->name,
                'nis_nip' => $user->identitas ?? $user->email,
                'kelas' => $user->kelas ?? '-',
                'phone' => $user->phone ?? '-',
            ],
            'buku' => [
                'id' => $item->id,
                'nama_alat' => $item->nama_alat,
                'kode_alat' => $item->kode_alat ?? '-',
                'lokasi' => $item->ruangan ?? '-',
                'stok' => max(0, (int) ($item->stok ?? 0)),
                'denda_keterlambatan' => max(0, (int) ($item->denda_keterlambatan ?? 0)),
                'kategori_buku' => $item->kategoriAlat?->nama ?? '-',
                'is_buku_pelajaran' => $isBukuPelajaran,
            ],
            'defaultDates' => [
                'tanggal_pinjam' => Carbon::today()->toDateString(),
                'tanggal_kembali' => Carbon::today()->addDays(6)->toDateString(),
            ],
            'maxBorrowPerUser' => Config::get('libranic.max_borrow_per_user', 2),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'alat_id' => 'required|exists:daftar_buku,id',
            'jumlah_pinjam' => 'required|integer|min:1',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali' => 'required|date|after_or_equal:tanggal_pinjam',
            'keperluan' => 'nullable|string|max:450',
        ]);

        $item = DaftarBarang::with('kategoriAlat:id,nama')->findOrFail($data['alat_id']);
        $user = $request->user();
        $maxBorrowPerUser = (int) Config::get('libranic.max_borrow_per_user', 2);
        $isBukuPelajaran = str_contains(
            mb_strtolower((string) ($item->kategoriAlat?->nama ?? ''), 'UTF-8'),
            'pelajaran'
        );

        if (!$isBukuPelajaran && (int) $data['jumlah_pinjam'] > $maxBorrowPerUser) {
            return Redirect::back()
                ->withErrors([
                    'jumlah_pinjam' => "Maksimal {$maxBorrowPerUser} unit untuk kategori ini.",
                ])
                ->withInput();
        }

        if (!$item->hasSufficientStock((int) $data['jumlah_pinjam'])) {
            return Redirect::back()
                ->withErrors([
                    'jumlah_pinjam' => 'Stok alat tidak mencukupi untuk jumlah yang diajukan.',
                ])
                ->withInput();
        }

        $loan = Peminjaman::create([
            'user_id' => $user->id,
            'daftarbarang_id' => $data['alat_id'],
            'nama_peminjam' => $user->name ?? '-',
            'nis_nip' => $user->identitas ?? $user->email ?? '-',
            'kelas' => $user->kelas ?? '-',
            'jumlah_pinjam' => $data['jumlah_pinjam'],
            'tanggal_pinjam' => $data['tanggal_pinjam'],
            'tanggal_kembali' => $data['tanggal_kembali'],
            'keperluan' => $data['keperluan'] ?? '-',
            'status' => 'menunggu',
            'denda_per_hari' => $item->denda_keterlambatan ?? 0,
        ]);

        $item->reserveStock((int) $data['jumlah_pinjam']);

        ActivityLog::record(
            $user->id,
            sprintf(
                'mengajukan peminjaman %s sebanyak %d unit.',
                $item->nama_alat ?? 'alat',
                (int) $data['jumlah_pinjam']
            ),
            [
                'context' => 'pengajuan_peminjaman',
                'loan_id' => $loan->id,
                'alat_id' => $item->id,
                'alat_nama' => $item->nama_alat,
                'jumlah_pinjam' => (int) $data['jumlah_pinjam'],
            ]
        );

        return Redirect::route('daftar-buku.index')
            ->with('success', 'Permohonan peminjaman berhasil dikirim.');
    }

    public function riwayat(): Response
    {
        $user = request()->user();
        $loans = Peminjaman::with(['alat', 'pengembalian'])
            ->where('user_id', $user->id)
            ->where(function ($query) {
                $query->where('status', 'ditolak')
                    ->orWhere('status', 'dikembalikan')
                    ->orWhereHas('pengembalian', function (Builder $query) {
                        $query->whereNotNull('tanggal_pengembalian');
                    });
            })
            ->orderBy('tanggal_pinjam', 'desc')
            ->get();

        $items = $loans->map(function (Peminjaman $loan) {
            $pengembalian = $loan->pengembalian;
            $returnStatus = $this->resolveReturnStatus($loan, $pengembalian);
            $lateDays = $pengembalian?->telat_hari;
            if ($lateDays === null) {
                $lateDays = $this->calculateLateDays($loan, $pengembalian);
            }
            $penalty = $pengembalian?->total_denda;
            if ($penalty === null) {
                $penalty = $lateDays * ($loan->denda_per_hari ?? 0);
            }

            return [
                'id' => $loan->id,
                'nama_alat' => $loan->alat?->nama_alat ?? '-',
                'nama_peminjam' => $loan->nama_peminjam ?? '-',
                'jumlah' => $loan->jumlah_pinjam,
                'batas_peminjaman' => $loan->tanggal_kembali?->toDateString(),
                'tanggal_dikembalikan' => $pengembalian?->tanggal_pengembalian?->toDateString(),
                'return_status' => $returnStatus,
                'return_status_label' => $this->statusLabel($returnStatus),
                'detail_url' => route('peminjaman.riwayat.detail', $loan),
                'late_days' => $lateDays,
                'penalty' => $penalty,
                'kelas' => $loan->kelas ?? '-',
                'kode_alat' => $loan->alat?->kode_alat ?? '-',
                'lokasi' => $loan->alat?->ruangan ?? '-',
                'alasan_penolakan' => $loan->alasan_penolakan,
                'pengembalian' => [
                    'kondisi' => $pengembalian?->kondisi,
                    'catatan' => $pengembalian?->catatan,
                    'catatan_admin' => $pengembalian?->catatan_admin,
                    'lampiran_url' => $pengembalian?->lampiran_path ? Storage::url($pengembalian->lampiran_path) : null,
                ],
            ];
        })->values()->all();

        return Inertia::render('pengguna/riwayat-peminjaman/riwayat-peminjaman', [
            'items' => $items,
        ]);
    }

    public function showRiwayat(Request $request, Peminjaman $loan): Response
    {
        $user = $request->user();
        abort_unless($loan->user_id === $user->id, 403);

        $loan->loadMissing(['alat', 'pengembalian']);
        $pengembalian = $loan->pengembalian;
        $returnStatus = $this->resolveReturnStatus($loan, $pengembalian);
        $lateDays = $pengembalian?->telat_hari;
        if ($lateDays === null) {
            $lateDays = $this->calculateLateDays($loan, $pengembalian);
        }
        $penalty = $pengembalian?->total_denda;
        if ($penalty === null) {
            $penalty = $lateDays * ($loan->denda_per_hari ?? 0);
        }

        return Inertia::render('pengguna/riwayat-peminjaman/detail-riwayat-peminjaman', [
            'loan' => [
                'id' => $loan->id,
                'nama_alat' => $loan->alat?->nama_alat ?? '-',
                'kode_alat' => $loan->alat?->kode_alat ?? '-',
                'lokasi' => $loan->alat?->ruangan ?? '-',
                'nama_peminjam' => $loan->nama_peminjam ?? '-',
                'kelas' => $loan->kelas ?? '-',
                'jumlah' => $loan->jumlah_pinjam,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
                'denda_per_hari' => $loan->denda_per_hari ?? 0,
                'alasan_penolakan' => $loan->alasan_penolakan,
            ],
            'pengembalian' => [
                'tanggal_pengembalian' => $pengembalian?->tanggal_pengembalian?->toDateString(),
                'kondisi' => $pengembalian?->kondisi,
                'catatan' => $pengembalian?->catatan,
                'catatan_admin' => $pengembalian?->catatan_admin,
                'lampiran_url' => $pengembalian?->lampiran_path ? Storage::url($pengembalian->lampiran_path) : null,
            ],
            'return_status' => $returnStatus,
            'return_status_label' => $this->statusLabel($returnStatus),
            'late_days' => $lateDays,
            'penalty' => $penalty,
        ]);
    }

    public function returnForm(Request $request, Peminjaman $loan): Response
    {
        $user = $request->user();
        abort_unless($loan->user_id === $user->id, 403);

        $loan->loadMissing('alat');

        return Inertia::render('pengguna/pengembalian/form-pengembalian', [
            'borrower' => [
                'nama' => $user->name,
                'nis_nip' => $user->identitas ?? $user->email ?? '-',
                'kelas' => $user->kelas ?? '-',
            ],
            'alat' => [
                'id' => $loan->alat?->id,
                'nama_alat' => $loan->alat?->nama_alat ?? '-',
                'kode_alat' => $loan->alat?->kode_alat ?? '-',
                'lokasi' => $loan->alat?->ruangan ?? '-',
            ],
            'loan' => [
                'id' => $loan->id,
                'jumlah_pinjam' => $loan->jumlah_pinjam,
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
                'keperluan' => $loan->keperluan,
                'denda_per_hari' => $loan->denda_per_hari ?? 0,
            ],
        ]);
    }

    private function resolveReturnStatus(Peminjaman $loan, ?Pengembalian $pengembalian): string
    {
        if ($loan->status === 'ditolak') {
            return 'ditolak';
        }

        return $pengembalian?->status ?? 'menunggu';
    }

    private function calculateLateDays(Peminjaman $loan, ?Pengembalian $pengembalian): int
    {
        if (! $pengembalian || ! $pengembalian->tanggal_pengembalian || ! $loan->tanggal_kembali) {
            return 0;
        }

        if ($pengembalian->tanggal_pengembalian->lessThanOrEqualTo($loan->tanggal_kembali)) {
            return 0;
        }

        return $loan->tanggal_kembali->diffInDays($pengembalian->tanggal_pengembalian);
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'menunggu' => 'Proses Pengecekan',
            'tepat waktu' => 'Tepat Waktu',
            'telat' => 'Telat',
            'rusak' => 'Rusak',
            'hilang' => 'Hilang',
            'ditolak' => 'Ditolak',
            default => 'Proses Pengecekan',
        };
    }

    private function normalizeLoanStatus(?string $status): string
    {
        if (! $status) {
            return 'menunggu';
        }

        $normalized = strtolower(trim($status));

        if ($normalized === 'menunggu persetujuan' || $normalized === 'pending') {
            return 'menunggu';
        }

        return $normalized;
    }

    private function authorizeLoanOwner(Request $request, Peminjaman $loan): void
    {
        abort_unless($loan->user_id === $request->user()?->id, 403);
    }

    private function canExtendLoan(Peminjaman $loan): bool
    {
        return $this->normalizeLoanStatus($loan->status) === 'disetujui'
            && (int) ($loan->perpanjangan_count ?? 0) < self::MAX_EXTENSION_COUNT;
    }

    private function isAwaitingApproval(?string $status): bool
    {
        return $this->normalizeLoanStatus($status) === 'menunggu';
    }

    private function loanPayload(Peminjaman $loan): array
    {
        $loan->loadMissing(['alat', 'pengembalian']);

        $normalizedStatus = $this->normalizeLoanStatus($loan->status);
        $extensionCount = (int) ($loan->perpanjangan_count ?? 0);

        return [
            'id' => $loan->id,
            'nama_alat' => $loan->alat?->nama_alat ?? '-',
            'kode_alat' => $loan->alat?->kode_alat ?? '-',
            'lokasi' => $loan->alat?->ruangan ?? '-',
            'nama_peminjam' => $loan->nama_peminjam ?? '-',
            'nis_nip' => $loan->nis_nip ?? '-',
            'kelas' => $loan->kelas ?? '-',
            'jumlah' => $loan->jumlah_pinjam,
            'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
            'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
            'keperluan' => $loan->keperluan,
            'status' => $normalizedStatus,
            'denda_per_hari' => $loan->denda_per_hari ?? 0,
            'perpanjangan_count' => $extensionCount,
            'max_extensions' => self::MAX_EXTENSION_COUNT,
            'remaining_extensions' => max(0, self::MAX_EXTENSION_COUNT - $extensionCount),
            'extension_step_days' => self::EXTENSION_STEP_DAYS,
            'next_return_date' => $loan->tanggal_kembali?->copy()->addDays(self::EXTENSION_STEP_DAYS)->toDateString(),
            'can_extend' => $this->canExtendLoan($loan),
            'can_delete' => $this->isAwaitingApproval($loan->status),
            'detail_url' => route('peminjaman.detail', $loan, false),
            'edit_url' => route('peminjaman.edit', $loan, false),
            'update_url' => route('peminjaman.update', $loan, false),
            'delete_url' => route('peminjaman.destroy', $loan, false),
            'return_url' => route('peminjaman.pengembalian.create', $loan, false),
        ];
    }
}
