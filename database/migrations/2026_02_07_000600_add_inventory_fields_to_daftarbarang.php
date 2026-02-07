<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('daftarbarang', function (Blueprint $table) {
            if (! Schema::hasColumn('daftarbarang', 'stok')) {
                $table->unsignedInteger('stok')->default(0)->after('kategori_alat_id');
            }

            if (! Schema::hasColumn('daftarbarang', 'kode_alat')) {
                $table->string('kode_alat')->nullable()->unique()->after('stok');
            }

            if (! Schema::hasColumn('daftarbarang', 'kondisi_alat')) {
                $table->text('kondisi_alat')->nullable()->after('denda_keterlambatan');
            }

            if (! Schema::hasColumn('daftarbarang', 'deskripsi')) {
                $table->text('deskripsi')->nullable()->after('kondisi_alat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('daftarbarang', function (Blueprint $table) {
            if (Schema::hasColumn('daftarbarang', 'deskripsi')) {
                $table->dropColumn('deskripsi');
            }

            if (Schema::hasColumn('daftarbarang', 'kondisi_alat')) {
                $table->dropColumn('kondisi_alat');
            }

            if (Schema::hasColumn('daftarbarang', 'kode_alat')) {
                $table->dropUnique(['kode_alat']);
                $table->dropColumn('kode_alat');
            }

            if (Schema::hasColumn('daftarbarang', 'stok')) {
                $table->dropColumn('stok');
            }
        });
    }
};
