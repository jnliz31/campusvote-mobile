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
            // Support single vote (backward compat) or batch vote
            'candidate_id' => 'required_without:candidates|exists:candidates,id',
            'candidates' => 'required_without:candidate_id|array|min:1',
            'candidates.*' => 'exists:candidates,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $election = Election::with('positions.candidates')->findOrFail($request->election_id);

        // Check if election is active
        if ($election->status !== 'active') {
            return response()->json(['error' => 'This election is not active'], 403);
        }

        // Check if user has already voted in this election
        $hasVoted = Vote::where('voter_id', $user->id)
            ->where('election_id', $request->election_id)
            ->exists();

        if ($hasVoted) {
            return response()->json(['error' => 'You have already voted in this election'], 403);
        }

        // Determine candidate IDs to vote for
        $candidateIds = $request->has('candidates')
            ? $request->candidates
            : [$request->candidate_id];

        // Collect all valid candidate IDs in this election
        $validCandidateIds = $election->positions->flatMap(function ($position) {
            return $position->candidates->pluck('id');
        })->toArray();

        // Validate all candidates belong to this election
        foreach ($candidateIds as $candidateId) {
            if (!in_array((int) $candidateId, $validCandidateIds)) {
                return response()->json(['error' => "Invalid candidate ID {$candidateId} for this election"], 422);
            }
        }

        // Create all votes in a transaction
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
