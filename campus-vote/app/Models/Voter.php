<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Voter extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'campus_email',
        'password',
        'course',
        'google_id',
        'student_id',
        'avatar',
        'is_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'password' => 'hashed',
    ];

    // Relationship with votes
    public function votes()
    {
        return $this->hasMany(Vote::class, 'voter_id');
    }

    // Check if voter has voted in specific election
    public function hasVotedIn($electionId)
    {
        return $this->votes()->where('election_id', $electionId)->exists();
    }

    public function facialProfile()
    {
        return $this->hasOne(FacialProfile::class);
    }

    public function getFacialConfigAttribute(): array
    {
        $profile = $this->facialProfile;

        return [
            'is_enrolled' => $profile ? $profile->is_enrolled : false,
            'is_verified' => $profile ? $profile->is_verified : false,
            'is_enabled' => $profile ? $profile->is_enabled : false,
            'status' => $profile ? $profile->status : 'not_enrolled',
            'verification_attempts' => $profile ? $profile->verification_attempts : 0,
            'last_verified_at' => $profile ? optional($profile->last_verified_at)->toIso8601String() : null,
            'last_failed_at' => $profile ? optional($profile->last_failed_at)->toIso8601String() : null,
            'updated_at' => $profile ? optional($profile->updated_at)->toIso8601String() : null,
        ];
    }

    public function isFacialVerificationRequired(): bool
    {
        $profile = $this->facialProfile;
        if (!$profile) {
            return true;
        }
        return $profile->is_enabled;
    }
}
