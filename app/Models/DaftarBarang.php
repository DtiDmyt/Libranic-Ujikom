<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class DaftarBarang extends Model
{
    use HasFactory;

    protected $table = 'daftarbarang';

    protected $fillable = [
        'nama_alat',
        'deskripsi_alat',
        'kategori_jurusan',
        'kategori_alat_id',
        'ruangan',
        'status',
        'gambar_path',
    ];

    protected $casts = [
        'kategori_alat_id' => 'integer',
    ];

    protected $appends = ['gambar_url'];

    protected $attributes = [
        'status' => 'draft',
    ];

    protected $hidden = ['gambar_path'];

    public function kategoriAlat(): BelongsTo
    {
        return $this->belongsTo(KategoriAlat::class);
    }

    public function getGambarUrlAttribute(): ?string
    {
        return $this->gambar_path ? Storage::disk('public')->url($this->gambar_path) : null;
    }
}
