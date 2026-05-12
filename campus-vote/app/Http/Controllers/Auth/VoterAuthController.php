<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VoterAuthController extends Controller
{
    public function check(Request $request)
    {
        $isAuthenticated = Auth::guard('voter')->check();

        return response()->json([
            'authenticated' => $isAuthenticated,
            'auth_token' => $isAuthenticated ? 'authenticated' : null,
            'user_role' => $isAuthenticated ? 'voter' : null,
            'voter' => $isAuthenticated ? Auth::guard('voter')->user() : null,
        ]);
    }

    public function showLogin()
    {
        return view('index');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('voter')->attempt($credentials)) {
            $request->session()->regenerate();
            
            // Return JSON for API
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'voter' => Auth::guard('voter')->user()
                ]);
            }
            
            return redirect()->intended('/voter/dashboard');
        }

        // Return JSON error for API
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::guard('voter')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }
        
        return redirect('/');
    }
}