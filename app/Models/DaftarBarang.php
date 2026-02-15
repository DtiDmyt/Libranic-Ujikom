<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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
        'kategori_jurusan',
        'kategori_alat_id',
        'stok',
        'kode_alat',
        'ruangan',
        'denda_keterlambatan',
        'kondisi_alat',
        'deskripsi',
        'status',
        'gambar_path',
    ];

    protected $casts = [
        'kategori_alat_id' => 'integer',
        'stok' => 'integer',
        'denda_keterlambatan' => 'integer',
    ];

    protected $appends = ['gambar_url'];

    protected $attributes = [
        'status' => 'draft',
        'denda_keterlambatan' => 0,
        'stok' => 0,
    ];

    protected $hidden = ['gambar_path'];

    public function kategoriAlat(): BelongsTo
    {
        return $this->belongsTo(KategoriAlat::class);
    }

    public function hasSufficientStock(int $amount): bool
    {
        if ($amount <= 0) {
            return true;
        }

        return ($this->stok ?? 0) >= $amount;
    }

    public function reserveStock(int $amount): bool
    {
        if ($amount <= 0) {
            return true;
        }

        if (!$this->hasSufficientStock($amount)) {
            return false;
        }

        $this->decrement('stok', $amount);

        return true;
    }

    public function releaseStock(int $amount): void
    {
        if ($amount <= 0) {
            return;
        }

        $this->increment('stok', $amount);
    }

    protected function gambarUrl(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes): ?string {
                $path = $attributes['gambar_path'] ?? null;

                if ($path === null || $path === '') {
                    return null;
                }

                return Storage::disk('public')->url((string) $path);
            },
        );
    }
}
