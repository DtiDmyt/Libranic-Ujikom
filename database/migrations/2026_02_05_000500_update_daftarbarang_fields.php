<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('daftarbarang', 'denda_keterlambatan')) {
            Schema::table('daftarbarang', function (Blueprint $table) {
                $table->unsignedBigInteger('denda_keterlambatan')->default(0)->after('ruangan');
            });
        }

        if (Schema::hasColumn('daftarbarang', 'deskripsi_alat')) {
            Schema::table('daftarbarang', function (Blueprint $table) {
                $table->dropColumn('deskripsi_alat');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('daftarbarang', 'deskripsi_alat')) {
            Schema::table('daftarbarang', function (Blueprint $table) {
                $table->text('deskripsi_alat')->nullable()->after('nama_alat');
            });
        }

        if (Schema::hasColumn('daftarbarang', 'denda_keterlambatan')) {
            Schema::table('daftarbarang', function (Blueprint $table) {
                $table->dropColumn('denda_keterlambatan');
            });
        }
    }
};
