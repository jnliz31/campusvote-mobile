<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'profile_picture'];
    protected $hidden = ['password'];
    protected $appends = ['profile_picture_url'];

    /**
     * Get the full URL for the admin's profile picture.
     */
    public function getProfilePictureUrlAttribute(): ?string
    {
        if (!$this->profile_picture) {
            return null;
        }

        return asset('storage/' . $this->profile_picture);
    }
}
