<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function voters(): HasMany
    {
        return $this->hasMany(Voter::class);
    }

    public function elections(): HasMany
    {
        return $this->hasMany(Election::class);
    }
}