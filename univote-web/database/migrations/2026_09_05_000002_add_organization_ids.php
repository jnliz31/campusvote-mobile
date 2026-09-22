<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('elections', 'organization_id')) {
            Schema::table('elections', function (Blueprint $table) {
                $table->foreignId('organization_id')->nullable()->after('description')->constrained()->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('voters', 'organization_id')) {
            Schema::table('voters', function (Blueprint $table) {
                $table->foreignId('organization_id')->nullable()->after('course')->constrained()->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropColumn('organization_id');
        });

        Schema::table('elections', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropColumn('organization_id');
        });
    }
};