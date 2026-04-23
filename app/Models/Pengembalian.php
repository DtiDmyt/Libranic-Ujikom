<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengembalian extends Model
{
    use HasFactory;

    protected $table = 'pengembalian';

    protected $fillable = [
        'peminjaman_id',
        'user_id',
        'tanggal_pengembalian',
        'kondisi',
        'catatan',
        'catatan_admin',
        'lampiran_path',
        'status',
        'telat_hari',
        'total_denda',
    ];

    protected $casts = [
        'tanggal_pengembalian' => 'date',
        'telat_hari' => 'integer',
        'total_denda' => 'integer',
    ];

    public function peminjaman(): BelongsTo
    {
        return $this->belongsTo(Peminjaman::class, 'peminjaman_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
