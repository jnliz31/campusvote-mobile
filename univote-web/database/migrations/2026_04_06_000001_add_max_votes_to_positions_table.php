<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('positions', 'max_votes')) {
            Schema::table('positions', function (Blueprint $table) {
                $table->integer('max_votes')->default(1)->after('order');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('positions', 'max_votes')) {
            Schema::table('positions', function (Blueprint $table) {
                $table->dropColumn('max_votes');
            });
        }
    }
};

