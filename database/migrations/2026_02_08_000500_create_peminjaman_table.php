<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('peminjaman', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('daftarbarang_id')->constrained('daftarbarang')->cascadeOnDelete();
            $table->unsignedInteger('jumlah_pinjam');
            $table->date('tanggal_pinjam');
            $table->date('tanggal_kembali');
            $table->text('keperluan');
            $table->string('status', 32)->default('menunggu');
            $table->unsignedBigInteger('denda_per_hari')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peminjaman');
    }
};
