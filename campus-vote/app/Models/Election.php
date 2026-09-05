<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Election extends Model
{
    protected $fillable = ['title', 'description', 'status', 'start_date', 'end_date', 'organization_id'];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function candidates()
    {
        return $this->hasManyThrough(Candidate::class, Position::class);
    }
}
