<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('pengembalian', 'catatan_petugas') && ! Schema::hasColumn('pengembalian', 'catatan_admin')) {
            Schema::table('pengembalian', function (Blueprint $table) {
                $table->renameColumn('catatan_petugas', 'catatan_admin');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('pengembalian', 'catatan_admin') && ! Schema::hasColumn('pengembalian', 'catatan_petugas')) {
            Schema::table('pengembalian', function (Blueprint $table) {
                $table->renameColumn('catatan_admin', 'catatan_petugas');
            });
        }
    }
};
