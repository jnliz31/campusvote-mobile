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
            'email' => 'required|string|email|max:255|unique:voters',
            'password' => 'required|string|min:8|confirmed',
            'course' => 'nullable|string|max:255',
        ]);

        $voter = Voter::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'course' => $request->course ?? '',
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