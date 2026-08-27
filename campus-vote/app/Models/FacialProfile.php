<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacialProfile extends Model
{
    protected $fillable = [
        'voter_id',
        'face_data',
        'face_id',
        'external_image_id',
        'quality_brightness',
        'quality_sharpness',
        'is_verified',
        'is_enabled',
        'verification_attempts',
        'last_verified_at',
        'last_failed_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_enabled' => 'boolean',
        'verification_attempts' => 'integer',
        'quality_brightness' => 'float',
        'quality_sharpness' => 'float',
        'last_verified_at' => 'datetime',
        'last_failed_at' => 'datetime',
    ];

    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class);
    }

    public function getStatusAttribute(): string
    {
        if (!$this->is_enabled) {
            return 'disabled';
        }
        if ($this->is_verified) {
            return 'verified';
        }
        return 'enrolled';
    }

    public function getIsEnrolledAttribute(): bool
    {
        // Prefer Rekognition face_id; fall back to legacy face_data
        return !empty($this->face_id) || !empty($this->face_data);
    }
}
