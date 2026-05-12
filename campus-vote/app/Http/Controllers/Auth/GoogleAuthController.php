<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google authentication page
     */
   public function redirect()
{
    // Simply redirect to Google OAuth
    return Socialite::driver('google')->redirect();
}

    /**
     * Handle Google callback
     */
    public function callback()
{
    try {
        $googleUser = Socialite::driver('google')->user();
        
        // Debug: Log the Google user info
        Log::info('Google User Data:', [
            'id' => $googleUser->getId(),
            'email' => $googleUser->getEmail(),
            'name' => $googleUser->getName(),
        ]);
        
        // Validate campus email domain
        if (!$this->isValidCampusEmail($googleUser->getEmail())) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please use your campus email address (@' . env('ALLOWED_CAMPUS_DOMAIN') . ').'
                ], 403);
            }
            return redirect()->route('voter.login')
                ->withErrors([
                    'email' => 'Please use your campus email address (@' . env('ALLOWED_CAMPUS_DOMAIN') . ').'
                ]);
        }

        // Find or create voter
        $voter = $this->findOrCreateVoter($googleUser);
        
        // Debug: Log voter creation
        Log::info('Voter created/found:', [
            'voter_id' => $voter->id,
            'email' => $voter->email,
        ]);

        // Log the voter in using voter guard
        Auth::guard('voter')->login($voter, true);
        
        // Debug: Check if logged in
        Log::info('Voter logged in:', [
            'is_logged_in' => Auth::guard('voter')->check(),
        ]);

        // Log successful authentication
        Log::info('Voter authenticated via Google', [
            'voter_id' => $voter->id,
            'email' => $voter->campus_email
        ]);

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Welcome back, ' . $voter->name . '!',
                'auth_token' => 'authenticated',
                'user_role' => 'voter',
                'user' => $voter,
            ]);
        }

        // Redirect back to home with success query param so frontend can detect and set localStorage
        return redirect('/?auth=success&role=voter')
            ->with('success', 'Welcome back, ' . $voter->name . '!');

    } catch (Exception $e) {
        // Log detailed error
        Log::error('Google authentication error', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);

        if (request()->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: ' . $e->getMessage()
            ], 401);
        }

        return redirect()->route('voter.login')
            ->withErrors([
                'error' => 'Authentication failed: ' . $e->getMessage()
            ]);
    }
}

    /**
     * Validate if email belongs to campus domain
     */
    private function isValidCampusEmail($email)
    {
        $allowedDomain = env('ALLOWED_CAMPUS_DOMAIN');
        
        if (empty($allowedDomain)) {
            return true; // If no domain restriction, allow all
        }
        
        return str_ends_with(strtolower($email), '@' . strtolower($allowedDomain));
    }

    /**
     * Find existing voter or create new one
     */
    private function findOrCreateVoter($googleUser)
    {
        // Try to find by Google ID first
        $voter = Voter::where('google_id', $googleUser->getId())->first();

        if ($voter) {
            // Update voter information
            $voter->update([
                'name' => $googleUser->getName(),
                'avatar' => $googleUser->getAvatar(),
                'is_verified' => true,
            ]);

            return $voter;
        }

        // Try to find by campus email
        $voter = Voter::where('email', $googleUser->getEmail())
            ->orWhere('campus_email', $googleUser->getEmail())
            ->first();

        if ($voter) {
            // Link Google account to existing voter
            $voter->update([
                'google_id' => $googleUser->getId(),
                'campus_email' => $googleUser->getEmail(),
                'avatar' => $googleUser->getAvatar(),
                'is_verified' => true,
            ]);

            return $voter;
        }

        // Create new voter
        return Voter::create([
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'campus_email' => $googleUser->getEmail(),
            'google_id' => $googleUser->getId(),
            'avatar' => $googleUser->getAvatar(),
            'is_verified' => true,
            'course' => 'To be updated', // Default value, voter can update later
        ]);
    }

    /**
     * Logout voter (this is different from the one in VoterAuthController)
     */
    public function logout()
    {
        Auth::guard('voter')->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'You have been logged out successfully.'
            ]);
        }

        return redirect()->route('voter.login')
            ->with('success', 'You have been logged out successfully.');
    }
}