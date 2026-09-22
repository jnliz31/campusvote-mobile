<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voter;
use Illuminate\Support\Facades\Hash;

class VoterSeeder extends Seeder
{
    public function run(): void
    {
        $voters = [
            ['name' => 'User One', 'email' => 'user1@example.com', 'course' => 'BSICT'],
            ['name' => 'User Two', 'email' => 'user2@example.com', 'course' => 'BSCS'],
            ['name' => 'User Three', 'email' => 'user3@example.com', 'course' => 'BSIT'],
            ['name' => 'User Four', 'email' => 'user4@example.com', 'course' => 'BSIS'],
            ['name' => 'User Five', 'email' => 'user5@example.com', 'course' => 'BSCpE'],
        ];

        foreach ($voters as $voter) {
            Voter::create([
                'name' => $voter['name'],
                'email' => $voter['email'],
                'password' => Hash::make('password'),
                'course' => $voter['course'],
            ]);
        }
    }
}