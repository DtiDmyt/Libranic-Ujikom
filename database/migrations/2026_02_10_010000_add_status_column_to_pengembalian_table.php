<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('pengembalian', 'status')) {
            return;
        }

        Schema::table('pengembalian', function (Blueprint $table) {
            $table->string('status')->default('menunggu')->after('tanggal_pengembalian');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('pengembalian', 'status')) {
            return;
        }

        Schema::table('pengembalian', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
