<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Convert legacy petugas accounts into peminjam accounts.
     */
    public function up(): void
    {
        DB::table('users')
            ->where('account_role', 'petugas')
            ->update(['account_role' => 'peminjam']);
    }

    /**
     * Best-effort rollback for accounts converted by this migration.
     */
    public function down(): void
    {
        DB::table('users')
            ->where('account_role', 'peminjam')
            ->whereNull('identitas')
            ->whereNull('role')
            ->update(['account_role' => 'petugas']);
    }
};
