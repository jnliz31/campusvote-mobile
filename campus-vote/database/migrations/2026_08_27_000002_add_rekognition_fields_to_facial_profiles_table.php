<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facial_profiles', function (Blueprint $table) {
            $table->string('face_id')->nullable()->after('face_data')
                ->comment('AWS Rekognition FaceId UUID from IndexFaces');
            $table->string('external_image_id')->nullable()->after('face_id')
                ->comment('Maps voter_id to Rekognition face for lookup');
            $table->float('quality_brightness')->nullable()->after('external_image_id')
                ->comment('Rekognition brightness quality metric (0-100)');
            $table->float('quality_sharpness')->nullable()->after('quality_brightness')
                ->comment('Rekognition sharpness quality metric (0-100)');
        });
    }

    public function down(): void
    {
        Schema::table('facial_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'face_id',
                'external_image_id',
                'quality_brightness',
                'quality_sharpness',
            ]);
        });
    }
};
