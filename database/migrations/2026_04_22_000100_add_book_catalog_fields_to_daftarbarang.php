<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('daftarbarang', function (Blueprint $table) {
            if (! Schema::hasColumn('daftarbarang', 'judul_buku')) {
                $table->string('judul_buku')->nullable()->after('id');
            }

            if (! Schema::hasColumn('daftarbarang', 'penulis')) {
                $table->string('penulis')->nullable()->after('nama_alat');
            }

            if (! Schema::hasColumn('daftarbarang', 'penerbit')) {
                $table->string('penerbit')->nullable()->after('penulis');
            }

            if (! Schema::hasColumn('daftarbarang', 'tahun_terbit')) {
                $table->unsignedSmallInteger('tahun_terbit')->nullable()->after('penerbit');
            }

            if (! Schema::hasColumn('daftarbarang', 'lokasi_rak')) {
                $table->string('lokasi_rak')->nullable()->after('ruangan');
            }

            if (! Schema::hasColumn('daftarbarang', 'status_buku')) {
                $table->enum('status_buku', ['tersedia', 'dipinjam', 'rusak', 'hilang'])
                    ->default('tersedia')
                    ->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('daftarbarang', function (Blueprint $table) {
            if (Schema::hasColumn('daftarbarang', 'status_buku')) {
                $table->dropColumn('status_buku');
            }

            if (Schema::hasColumn('daftarbarang', 'lokasi_rak')) {
                $table->dropColumn('lokasi_rak');
            }

            if (Schema::hasColumn('daftarbarang', 'tahun_terbit')) {
                $table->dropColumn('tahun_terbit');
            }

            if (Schema::hasColumn('daftarbarang', 'penerbit')) {
                $table->dropColumn('penerbit');
            }

            if (Schema::hasColumn('daftarbarang', 'penulis')) {
                $table->dropColumn('penulis');
            }

            if (Schema::hasColumn('daftarbarang', 'judul_buku')) {
                $table->dropColumn('judul_buku');
            }
        });
    }
};
