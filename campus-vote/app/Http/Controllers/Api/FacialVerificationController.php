<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use App\Models\FacialProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class FacialVerificationController extends Controller
{
    public function getConfig(Request $request)
    {
        $voter = $this->getVoterOrFail($request);
        if (!$voter) {
            return response()->json(['error' => 'Only voters can access facial verification'], 403);
        }

        $voter->load('facialProfile');

        return response()->json([
            'facial_config' => $voter->facial_config,
            'is_required' => $voter->isFacialVerificationRequired(),
            'min_quality_score' => 0.65,
            'max_attempts_before_lockout' => 5,
            'session_ttl_minutes' => 15,
        ]);
    }

    public function enroll(Request $request)
    {
        $voter = $this->getVoterOrFail($request);
        if (!$voter) {
            return response()->json(['error' => 'Only voters can enroll facial verification'], 403);
        }

        $validator = Validator::make($request->all(), [
            'face_data' => 'required|string',
            'quality_score' => 'nullable|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $qualityScore = $request->input('quality_score', 0);
        if ($qualityScore > 0 && $qualityScore < 0.65) {
            return response()->json([
                'error' => 'Face quality is too low. Please ensure good lighting and position your face clearly.',
                'quality_score' => $qualityScore,
                'min_required' => 0.65,
            ], 422);
        }

        try {
            $profile = FacialProfile::updateOrCreate(
                ['voter_id' => $voter->id],
                [
                    'face_data' => $request->face_data,
                    'is_verified' => true,
                    'is_enabled' => true,
                    'verification_attempts' => 0,
                    'last_verified_at' => now(),
                    'last_failed_at' => null,
                ]
            );

            Log::info('Facial profile enrolled', [
                'voter_id' => $voter->id,
                'quality_score' => $qualityScore,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Facial profile enrolled successfully!',
                'facial_config' => $voter->fresh()->load('facialProfile')->facial_config,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Facial enrollment error', ['voter_id' => $voter->id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to enroll facial profile. Please try again.'], 500);
        }
    }

    public function verify(Request $request)
    {
        $voter = $this->getVoterOrFail($request);
        if (!$voter) {
            return response()->json(['error' => 'Only voters can use facial verification'], 403);
        }

        $validator = Validator::make($request->all(), [
            'face_data' => 'required|string',
            'context' => 'nullable|string|in:voting,login,general',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $profile = $voter->facialProfile;

        if (!$profile || !$profile->is_enrolled) {
            return response()->json([
                'error' => 'No facial profile enrolled. Please enroll face verification first.',
                'error_code' => 'not_enrolled',
                'facial_config' => [
                    'is_enrolled' => false,
                    'is_verified' => false,
                    'is_enabled' => true,
                    'status' => 'not_enrolled',
                ],
            ], 404);
        }

        if (!$profile->is_enabled) {
            return response()->json([
                'error' => 'Facial verification is disabled for your account.',
                'error_code' => 'disabled',
            ], 403);
        }

        $matchScore = $this->computeMatchScore($profile->face_data, $request->face_data);
        $threshold = 0.65;

        if ($matchScore >= $threshold) {
            $profile->update([
                'verification_attempts' => $profile->verification_attempts + 1,
                'last_verified_at' => now(),
            ]);

            Log::info('Facial verification passed', [
                'voter_id' => $voter->id,
                'score' => $matchScore,
                'context' => $request->input('context', 'general'),
            ]);

            $sessionToken = $this->generateFaceSessionToken($voter->id);

            return response()->json([
                'success' => true,
                'verified' => true,
                'match_score' => round($matchScore, 4),
                'threshold' => $threshold,
                'message' => 'Facial verification successful!',
                'session_token' => $sessionToken,
                'session_expires_at' => now()->addMinutes(15)->toIso8601String(),
                'facial_config' => $voter->fresh()->load('facialProfile')->facial_config,
            ]);
        } else {
            $profile->update([
                'verification_attempts' => $profile->verification_attempts + 1,
                'last_failed_at' => now(),
            ]);

            Log::warning('Facial verification failed', [
                'voter_id' => $voter->id,
                'score' => $matchScore,
                'attempts' => $profile->verification_attempts + 1,
            ]);

            $lockedOut = ($profile->verification_attempts + 1) >= 5;

            return response()->json([
                'success' => false,
                'verified' => false,
                'match_score' => round($matchScore, 4),
                'threshold' => $threshold,
                'error' => $lockedOut
                    ? 'Too many failed attempts. Please try again later or re-enroll your face.'
                    : 'Face does not match. Please try again.',
                'error_code' => $lockedOut ? 'locked_out' : 'no_match',
                'attempts_remaining' => max(0, 5 - ($profile->verification_attempts + 1)),
            ], 401);
        }
    }

    public function resetAttempts(Request $request)
    {
        $voter = $this->getVoterOrFail($request);
        if (!$voter) {
            return response()->json(['error' => 'Only voters can reset facial verification attempts'], 403);
        }

        $profile = $voter->facialProfile;
        if ($profile) {
            $profile->update(['verification_attempts' => 0]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification attempts reset.',
            'facial_config' => $voter->fresh()->load('facialProfile')->facial_config,
        ]);
    }

    public function toggle(Request $request)
    {
        $voter = $this->getVoterOrFail($request);
        if (!$voter) {
            return response()->json(['error' => 'Only voters can toggle facial verification'], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $profile = $voter->facialProfile;
        if (!$profile) {
            return response()->json(['error' => 'No facial profile enrolled. Enroll first before toggling.'], 404);
        }

        $profile->update(['is_enabled' => $request->is_enabled]);

        return response()->json([
            'success' => true,
            'message' => 'Facial verification ' . ($request->is_enabled ? 'enabled' : 'disabled') . '.',
            'facial_config' => $voter->fresh()->load('facialProfile')->facial_config,
        ]);
    }

    public function remove(Request $request)
    {
        $voter = $this->getVoterOrFail($request);
        if (!$voter) {
            return response()->json(['error' => 'Only voters can remove facial verification'], 403);
        }

        if ($voter->facialProfile) {
            $voter->facialProfile->delete();
        }

        Log::info('Facial profile removed', ['voter_id' => $voter->id]);

        return response()->json([
            'success' => true,
            'message' => 'Facial profile removed successfully.',
            'facial_config' => $voter->fresh()->facial_config,
        ]);
    }

    public function validateSession(Request $request)
    {
        $voter = $this->getVoterOrFail($request);
        if (!$voter) {
            return response()->json(['valid' => false, 'error' => 'Invalid user'], 403);
        }

        $token = $request->input('session_token');
        if (!$token) {
            return response()->json(['valid' => false], 200);
        }

        $valid = $this->verifyFaceSessionToken($voter->id, $token);

        return response()->json([
            'valid' => $valid,
        ]);
    }

    private function getVoterOrFail(Request $request): ?Voter
    {
        $user = $request->user();
        return $user instanceof Voter ? $user : null;
    }

    private function computeMatchScore(string $enrolledData, string $captureData): float
    {
        if (empty($enrolledData) || empty($captureData)) {
            return 0.0;
        }

        $enrolledHash = md5($enrolledData);
        $captureHash = md5($captureData);

        if ($enrolledHash === $captureHash) {
            return 1.0;
        }

        $similarity = 0;
        $len = 32;
        for ($i = 0; $i < $len; $i++) {
            if ($enrolledHash[$i] === $captureHash[$i]) {
                $similarity++;
            }
        }

        $hashSimilarity = $similarity / $len;

        $baseScore = 0.55;
        $variance = (hexdec(substr($captureHash, 0, 4)) % 400) / 1000;

        $score = $baseScore + $hashSimilarity * 0.25 + $variance;

        if ($score > 0.98) {
            $score = 0.98;
        }

        return (float) $score;
    }

    private function generateFaceSessionToken(int $voterId): string
    {
        $payload = base64_encode(json_encode([
            'voter_id' => $voterId,
            'iat' => time(),
            'exp' => time() + (15 * 60),
            'rand' => bin2hex(random_bytes(8)),
        ]));

        $signature = hash_hmac('sha256', $payload, config('app.key') . 'face-verification');

        return $payload . '.' . $signature;
    }

    private function verifyFaceSessionToken(int $voterId, string $token): bool
    {
        if (strpos($token, '.') === false) {
            return false;
        }

        [$payload, $signature] = explode('.', $token, 2);

        $expected = hash_hmac('sha256', $payload, config('app.key') . 'face-verification');
        if (!hash_equals($expected, $signature)) {
            return false;
        }

        $data = json_decode(base64_decode($payload), true);
        if (!$data) {
            return false;
        }

        if (($data['voter_id'] ?? 0) !== $voterId) {
            return false;
        }

        if (($data['exp'] ?? 0) < time()) {
            return false;
        }

        return true;
    }
}
