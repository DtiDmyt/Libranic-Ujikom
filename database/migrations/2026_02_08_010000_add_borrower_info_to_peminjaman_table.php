<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->string('nama_peminjam')->after('daftarbarang_id');
            $table->string('nis_nip')->after('nama_peminjam');
            $table->string('kelas')->after('nis_nip')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropColumn(['nama_peminjam', 'nis_nip', 'kelas']);
        });
    }
};
