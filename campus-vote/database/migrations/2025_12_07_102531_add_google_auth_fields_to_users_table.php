<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('voters', function (Blueprint $table) {  // ✅ Changed to 'voters'
            $table->string('google_id')->nullable()->unique()->after('id');
            $table->string('campus_email')->nullable()->unique()->after('email');  // ✅ Added nullable()
            $table->string('student_id')->nullable()->after('campus_email');
            $table->string('avatar')->nullable()->after('student_id');
            $table->boolean('is_verified')->default(true)->after('avatar');  // ✅ Changed to default(true)
            
            // Make password nullable for Google-only auth
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {  // ✅ Changed to 'voters'
            $table->dropColumn(['google_id', 'campus_email', 'student_id', 'avatar', 'is_verified']);
            $table->string('password')->nullable(false)->change();
        });
    }
};