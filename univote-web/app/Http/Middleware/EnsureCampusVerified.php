<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class EnsureCampusVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the voter from the voter guard
        $voter = Auth::guard('voter')->user();

        // If no voter, redirect to login
        if (!$voter) {
            return redirect()->route('voter.login')
                ->withErrors(['error' => 'Please sign in with your campus email.']);
        }

        // Check if voter is verified (only for Google auth users)
        // If voter has google_id, they must be verified
        if ($voter->google_id && !$voter->is_verified) {
            Auth::guard('voter')->logout();
            return redirect()->route('voter.login')
                ->withErrors(['error' => 'Your campus email is not verified. Please contact administrator.']);
        }

        // Allow through
        return $next($request);
    }
}