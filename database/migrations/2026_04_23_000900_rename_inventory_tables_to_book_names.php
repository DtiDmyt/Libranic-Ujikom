<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('kategori_alat') && ! Schema::hasTable('kategori_buku')) {
            Schema::rename('kategori_alat', 'kategori_buku');
        }

        if (Schema::hasTable('daftarbarang') && ! Schema::hasTable('daftar_buku')) {
            Schema::rename('daftarbarang', 'daftar_buku');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('daftar_buku') && ! Schema::hasTable('daftarbarang')) {
            Schema::rename('daftar_buku', 'daftarbarang');
        }

        if (Schema::hasTable('kategori_buku') && ! Schema::hasTable('kategori_alat')) {
            Schema::rename('kategori_buku', 'kategori_alat');
        }
    }
};
