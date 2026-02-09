<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\DaftarBarang;
use App\Models\User;
use App\Models\Pengembalian;

class Peminjaman extends Model
{
    use HasFactory;

    protected $table = 'peminjaman';

    protected $fillable = [
        'user_id',
        'daftarbarang_id',
        'nama_peminjam',
        'nis_nip',
        'kelas',
        'jumlah_pinjam',
        'tanggal_pinjam',
        'tanggal_kembali',
        'keperluan',
        'status',
        'denda_per_hari',
        'alasan_penolakan',
    ];

    protected $casts = [
        'jumlah_pinjam' => 'integer',
        'tanggal_pinjam' => 'date',
        'tanggal_kembali' => 'date',
        'denda_per_hari' => 'integer',
    ];

    public function alat(): BelongsTo
    {
        return $this->belongsTo(DaftarBarang::class, 'daftarbarang_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pengembalian(): HasOne
    {
        return $this->hasOne(Pengembalian::class, 'peminjaman_id');
    }
}
