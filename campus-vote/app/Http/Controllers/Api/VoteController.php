<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vote;
use App\Models\Election;
use App\Models\Voter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VoteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user instanceof Voter) {
            return response()->json(['error' => 'Only voters can view votes'], 403);
        }

        $votes = Vote::where('voter_id', $user->id)
            ->with(['election', 'candidate.position'])
            ->get();

        return response()->json($votes->map(function ($vote) {
            return [
                'id' => $vote->id,
                'user_id' => $vote->voter_id,
                'election_id' => $vote->election_id,
                'candidate_id' => $vote->candidate_id,
                'created_at' => $vote->created_at,
                'election' => [
                    'id' => $vote->election->id,
                    'title' => $vote->election->title,
                ],
                'candidate' => [
                    'id' => $vote->candidate->id,
                    'name' => $vote->candidate->name,
                    'position' => $vote->candidate->position->name,
                ],
            ];
        }));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user instanceof Voter) {
            return response()->json(['error' => 'Only voters can cast votes'], 403);
        }

        $validator = Validator::make($request->all(), [
            'election_id' => 'required|exists:elections,id',
            'candidate_id' => 'required_without:candidates|exists:candidates,id',
            'candidates' => 'required_without:candidate_id|array|min:1',
            'candidates.*' => 'exists:candidates,id',
            'facial_session_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $election = Election::with('positions.candidates')->findOrFail($request->election_id);

        if ($election->status !== 'active') {
            return response()->json(['error' => 'This election is not active'], 403);
        }

        if ($election->organization_id && $election->organization_id !== $user->organization_id) {
            return response()->json(['error' => 'You are not eligible to vote in this organization election.'], 403);
        }

        $hasVoted = Vote::where('voter_id', $user->id)
            ->where('election_id', $request->election_id)
            ->exists();

        if ($hasVoted) {
            return response()->json(['error' => 'You have already voted in this election'], 403);
        }

        $user->load('facialProfile');

        if ($user->isFacialVerificationRequired()) {
            if (!$request->has('facial_session_token') || empty($request->facial_session_token)) {
                return response()->json([
                    'error' => 'Facial verification is required before casting a vote.',
                    'error_code' => 'facial_verification_required',
                    'facial_config' => $user->facial_config,
                ], 403);
            }

            if (!$this->validateFacialSession($user->id, $request->facial_session_token)) {
                return response()->json([
                    'error' => 'Facial verification session is invalid or expired. Please verify your face again.',
                    'error_code' => 'facial_session_invalid',
                    'facial_config' => $user->facial_config,
                ], 403);
            }
        }

        $candidateIds = $request->has('candidates')
            ? $request->candidates
            : [$request->candidate_id];

        $validCandidateIds = $election->positions->flatMap(function ($position) {
            return $position->candidates->pluck('id');
        })->toArray();

        foreach ($candidateIds as $candidateId) {
            if (!in_array((int) $candidateId, $validCandidateIds)) {
                return response()->json(['error' => "Invalid candidate ID {$candidateId} for this election"], 422);
            }
        }

        DB::beginTransaction();
        try {
            $createdVotes = [];
            foreach ($candidateIds as $candidateId) {
                $vote = Vote::create([
                    'voter_id' => $user->id,
                    'election_id' => $request->election_id,
                    'candidate_id' => $candidateId,
                ]);
                $createdVotes[] = $vote;
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Votes submitted successfully',
                'votes' => count($createdVotes),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to submit votes: ' . $e->getMessage()], 500);
        }
    }

    private function validateFacialSession(int $voterId, string $token): bool
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

    public function checkVote(Request $request, $electionId)
    {
        $user = $request->user();

        if (!$user instanceof Voter) {
            return response()->json(['has_voted' => false]);
        }

        $hasVoted = Vote::where('voter_id', $user->id)
            ->where('election_id', $electionId)
            ->exists();

        return response()->json(['has_voted' => $hasVoted]);
    }
}
