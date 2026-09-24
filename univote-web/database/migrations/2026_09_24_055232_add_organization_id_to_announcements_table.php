<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (!Schema::hasColumn('announcements', 'organization_id')) {
                $table->foreignId('organization_id')->nullable()->after('type')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('announcements', 'admin_id')) {
                $table->foreignId('admin_id')->nullable()->after('organization_id')->constrained('admins')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (Schema::hasColumn('announcements', 'organization_id')) {
                $table->dropForeign(['organization_id']);
                $table->dropColumn('organization_id');
            }
            if (Schema::hasColumn('announcements', 'admin_id')) {
                $table->dropForeign(['admin_id']);
                $table->dropColumn('admin_id');
            }
        });
    }
};
