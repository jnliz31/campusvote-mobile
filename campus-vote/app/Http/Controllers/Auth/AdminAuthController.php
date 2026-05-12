<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthController extends Controller
{
    public function check(Request $request)
    {
        $isAuthenticated = Auth::guard('admin')->check();

        return response()->json([
            'authenticated' => $isAuthenticated,
            'auth_token' => $isAuthenticated ? 'authenticated' : null,
            'user_role' => $isAuthenticated ? 'admin' : null,
            'admin' => $isAuthenticated ? Auth::guard('admin')->user() : null,
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

        if (Auth::guard('admin')->attempt($credentials)) {
            $request->session()->regenerate();
            
            // Return JSON for API
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'admin' => Auth::guard('admin')->user()
                ]);
            }
            
            return redirect()->intended('/admin/dashboard');
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
        Auth::guard('admin')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }
        
        return redirect('/admin/login');
    }
}