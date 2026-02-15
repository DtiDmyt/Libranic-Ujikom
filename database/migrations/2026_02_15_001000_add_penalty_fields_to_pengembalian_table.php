<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pengembalian', function (Blueprint $table) {
            $table->unsignedInteger('telat_hari')->nullable()->after('status');
            $table->unsignedBigInteger('total_denda')->nullable()->after('telat_hari');
        });
    }

    public function down(): void
    {
        Schema::table('pengembalian', function (Blueprint $table) {
            $table->dropColumn(['telat_hari', 'total_denda']);
        });
    }
};
