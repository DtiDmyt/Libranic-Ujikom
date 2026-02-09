<?php

namespace App\Http\Controllers\Pengguna;

use App\Http\Controllers\Controller;
use App\Models\DaftarBarang;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->string('search')->toString();
        $statusFilter = $request->string('status')->toString() ?: 'semua';

        $query = Peminjaman::with('alat')->where('user_id', $user->id);

        if ($statusFilter !== 'semua') {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $query->whereHas('alat', function (Builder $builder) use ($search) {
                $builder->where('nama_alat', 'like', '%' . $search . '%');
            });
        }

        $items = $query->latest('created_at')->get()->map(function (Peminjaman $loan) {
            return [
                'id' => $loan->id,
                'nama_alat' => $loan->alat?->nama_alat ?? '-',
                'kode_alat' => $loan->alat?->kode_alat ?? '-',
                'jumlah' => $loan->jumlah_pinjam,
                'kelas' => $loan->kelas ?? '-',
                'tanggal_pinjam' => $loan->tanggal_pinjam?->toDateString(),
                'tanggal_kembali' => $loan->tanggal_kembali?->toDateString(),
                'keperluan' => $loan->keperluan,
                'status' => $loan->status,
                'denda_per_hari' => $loan->denda_per_hari ?? 0,
                'alasan_penolakan' => $loan->alasan_penolakan,
            ];
        })->values()->all();

        $statusOptions = [
            ['value' => 'semua', 'label' => 'Semua Status'],
            ['value' => 'menunggu', 'label' => 'Menunggu Persetujuan'],
            ['value' => 'disetujui', 'label' => 'Disetujui'],
            ['value' => 'dikembalikan', 'label' => 'Dikembalikan'],
            ['value' => 'ditolak', 'label' => 'Ditolak'],
        ];

        return Inertia::render('pengguna/peminjaman/daftar-peminjaman', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            'statusOptions' => $statusOptions,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = Auth::user();
        $itemId = (int) $request->query('alat');
        $item = DaftarBarang::findOrFail($itemId);

        return Inertia::render('pengguna/peminjaman/form-peminjaman', [
            'borrower' => [
                'nama' => $user->name,
                'nis_nip' => $user->identitas ?? $user->email,
                'kelas' => $user->kelas ?? '-',
            ],
            'alat' => [
                'id' => $item->id,
                'nama_alat' => $item->nama_alat,
                'kode_alat' => $item->kode_alat ?? '-',
                'lokasi' => $item->ruangan ?? '-',
                'stok' => max(0, (int) ($item->stok ?? 0)),
                'denda_keterlambatan' => max(0, (int) ($item->denda_keterlambatan ?? 0)),
            ],
            'defaultDates' => [
                'tanggal_pinjam' => Carbon::today()->toDateString(),
                'tanggal_kembali' => Carbon::today()->addDays(6)->toDateString(),
            ],
            'maxBorrowPerUser' => Config::get('simanic.max_borrow_per_user', 2),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'alat_id' => 'required|exists:daftarbarang,id',
            'jumlah_pinjam' => 'required|integer|min:1',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali' => 'required|date|after_or_equal:tanggal_pinjam',
            'keperluan' => 'required|string|max:450',
        ]);

        $item = DaftarBarang::findOrFail($data['alat_id']);
        $user = $request->user();

        Peminjaman::create([
            'user_id' => $user->id,
            'daftarbarang_id' => $data['alat_id'],
            'nama_peminjam' => $user->name ?? '-',
            'nis_nip' => $user->identitas ?? $user->email ?? '-',
            'kelas' => $user->kelas ?? '-',
            'jumlah_pinjam' => $data['jumlah_pinjam'],
            'tanggal_pinjam' => $data['tanggal_pinjam'],
            'tanggal_kembali' => $data['tanggal_kembali'],
            'keperluan' => $data['keperluan'],
            'status' => 'menunggu',
            'denda_per_hari' => $item->denda_keterlambatan ?? 0,
        ]);

        return Redirect::route('daftar-alat.index')
            ->with('success', 'Permohonan peminjaman berhasil dikirim.');
    }
}
