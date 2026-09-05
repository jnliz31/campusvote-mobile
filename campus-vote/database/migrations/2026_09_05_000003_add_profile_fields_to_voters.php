<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            if (!Schema::hasColumn('voters', 'age')) {
                $table->unsignedTinyInteger('age')->nullable()->after('name');
            }
            if (!Schema::hasColumn('voters', 'sex')) {
                $table->string('sex', 30)->nullable()->after('age');
            }
            if (!Schema::hasColumn('voters', 'year_level')) {
                $table->string('year_level', 50)->nullable()->after('course');
            }
        });
    }

    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            foreach (['age', 'sex', 'year_level'] as $column) {
                if (Schema::hasColumn('voters', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};