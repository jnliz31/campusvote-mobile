<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'campus_email',
        'password',
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
        'email_verified_at' => 'datetime',
        'is_verified' => 'boolean',
        'password' => 'hashed',
    ];

    // Relationship with votes
    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    // Check if user has voted in specific election
    public function hasVotedIn($electionId)
    {
        return $this->votes()->where('election_id', $electionId)->exists();
    }
}