<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vote;
use App\Models\Election;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoteController extends Controller
{
    public function index(Request $request)
    {
        $votes = $request->user()->votes()->with(['election', 'candidate'])->get();
        return response()->json($votes);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_id' => 'required|exists:elections,id',
            'candidate_id' => 'required|exists:candidates,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $election = Election::findOrFail($request->election_id);

        // Check if election is active
        if (!$election->isActive()) {
            return response()->json(['error' => 'This election is not active'], 403);
        }

        // Check if user has already voted in this election
        if ($request->user()->hasVotedInElection($request->election_id)) {
            return response()->json(['error' => 'You have already voted in this election'], 403);
        }

        // Verify candidate belongs to this election
        $candidate = $election->candidates()->where('id', $request->candidate_id)->first();
        if (!$candidate) {
            return response()->json(['error' => 'Invalid candidate for this election'], 422);
        }

        $vote = Vote::create([
            'user_id' => $request->user()->id,
            'election_id' => $request->election_id,
            'candidate_id' => $request->candidate_id,
        ]);

        return response()->json($vote, 201);
    }

    public function checkVote(Request $request, $electionId)
    {
        $hasVoted = $request->user()->hasVotedInElection($electionId);
        return response()->json(['has_voted' => $hasVoted]);
    }
}
