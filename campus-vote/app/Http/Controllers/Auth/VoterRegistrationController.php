<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

class VoterRegistrationController extends Controller
{
    public function showRegistrationForm()
    {
        return view('index');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'nullable|integer|min:1|max:120',
            'sex' => 'nullable|string|max:30',
            'year_level' => 'nullable|string|max:50',
            'email' => 'required|string|email|max:255|unique:voters',
            'password' => 'required|string|min:8|confirmed',
            'course' => 'nullable|string|max:255',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        $voter = Voter::create([
            'name' => $request->name,
            'age' => $request->age,
            'sex' => $request->sex,
            'year_level' => $request->year_level,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'course' => $request->course ?? '',
            'organization_id' => $request->organization_id,
        ]);

        event(new Registered($voter));

        // Return JSON for API
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please log in.',
                'voter' => $voter
            ], 201);
        }

        auth()->guard('voter')->login($voter);
        return redirect()->route('voter.dashboard');
    }
}