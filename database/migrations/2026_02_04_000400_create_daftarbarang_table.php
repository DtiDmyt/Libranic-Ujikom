<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('daftarbarang', function (Blueprint $table) {
            $table->id();
            $table->string('nama_alat');
            $table->string('kategori_jurusan');
            $table->foreignId('kategori_alat_id')->constrained('kategori_alat')->cascadeOnDelete();
            $table->string('ruangan');
            $table->unsignedBigInteger('denda_keterlambatan')->default(0);
            $table->enum('status', ['publik', 'draft'])->default('draft');
            $table->string('gambar_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daftarbarang');
    }
};
