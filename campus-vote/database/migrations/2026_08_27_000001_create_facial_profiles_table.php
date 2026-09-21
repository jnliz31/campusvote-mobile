<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facial_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('voter_id')->unique();
            $table->longText('face_data');
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->integer('verification_attempts')->default(0);
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamp('last_failed_at')->nullable();
            $table->timestamps();

            $table->foreign('voter_id')
                ->references('id')
                ->on('voters')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facial_profiles');
    }
};
