<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Check if admin already exists
        if (Admin::where('email', 'admin@example.com')->exists()) {
            $this->command->info('Admin already exists. Skipping...');
            return;
        }

        Admin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->command->info('Admin created successfully!');
    }
}