<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('organizations')) {
            Schema::create('organizations', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('code', 20)->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            if (!Schema::hasColumn('organizations', 'code')) {
                Schema::table('organizations', function (Blueprint $table) {
                    $table->string('code', 20)->nullable()->unique()->after('name');
                });
            }
            if (!Schema::hasColumn('organizations', 'is_active')) {
                Schema::table('organizations', function (Blueprint $table) {
                    $table->boolean('is_active')->default(true)->after('code');
                });
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};