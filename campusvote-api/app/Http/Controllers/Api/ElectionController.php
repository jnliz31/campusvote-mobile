<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ElectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Election::with('candidates');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $elections = $query->orderBy('created_at', 'desc')->get();

        return response()->json($elections);
    }

    public function show($id)
    {
        $election = Election::with('candidates')->findOrFail($id);
        return response()->json($election);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:draft,active,closed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $election = Election::create($request->all());
        return response()->json($election, 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:draft,active,closed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $election = Election::findOrFail($id);
        $election->update($request->all());
        return response()->json($election);
    }

    public function destroy($id)
    {
        $election = Election::findOrFail($id);
        $election->delete();
        return response()->json(['message' => 'Election deleted successfully']);
    }

    public function results($id)
    {
        $election = Election::with(['candidates', 'candidates.votes'])->findOrFail($id);

        $results = $election->candidates->map(function ($candidate) {
            return [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'position' => $candidate->position,
                'vote_count' => $candidate->voteCount(),
            ];
        })->sortByDesc('vote_count')->values();

        return response()->json([
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status,
            ],
            'results' => $results,
            'total_votes' => $election->votes()->count(),
        ]);
    }
}
