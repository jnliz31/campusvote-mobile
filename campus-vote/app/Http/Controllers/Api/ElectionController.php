<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Election;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ElectionController extends Controller
{
    private function mapStatusToApi($status)
    {
        return $status === 'ended' ? 'closed' : $status;
    }

    private function mapStatusFromApi($status)
    {
        return $status === 'closed' ? 'ended' : 'active';
    }

    private function transformElection($election)
    {
        return [
            'id' => $election->id,
            'title' => $election->title,
            'description' => $election->description,
            'status' => $this->mapStatusToApi($election->status),
            'start_date' => $election->start_date,
            'end_date' => $election->end_date,
            'candidates' => $election->positions->flatMap(function ($position) use ($election) {
                return $position->candidates->map(function ($candidate) use ($election, $position) {
                    return [
                        'id' => $candidate->id,
                        'election_id' => $election->id,
                        'name' => $candidate->name,
                        'position' => $position->name,
                        'description' => $candidate->description,
                        'photo' => $candidate->photo,
                    ];
                });
            })->values(),
        ];
    }

    public function index(Request $request)
    {
        $query = Election::with('positions.candidates');

        if ($request->has('status')) {
            $dbStatus = $this->mapStatusFromApi($request->status);
            $query->where('status', $dbStatus);
        }

        $elections = $query->orderBy('created_at', 'desc')->get();

        return response()->json($elections->map(fn($e) => $this->transformElection($e)));
    }

    public function show($id)
    {
        $election = Election::with('positions.candidates')->findOrFail($id);
        return response()->json($this->transformElection($election));
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

        $data = $request->all();
        $data['status'] = $this->mapStatusFromApi($request->input('status', 'active'));

        $election = Election::create($data);
        return response()->json($this->transformElection($election->load('positions.candidates')), 201);
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
        $data = $request->all();

        if (isset($data['status'])) {
            $data['status'] = $this->mapStatusFromApi($data['status']);
        }

        $election->update($data);
        return response()->json($this->transformElection($election->load('positions.candidates')));
    }

    public function destroy($id)
    {
        $election = Election::findOrFail($id);
        $election->delete();
        return response()->json(['message' => 'Election deleted successfully']);
    }

    public function results($id)
    {
        $election = Election::with('positions.candidates.votes')->findOrFail($id);

        $positions = $election->positions->map(function ($position) {
            $candidates = $position->candidates()->withCount('votes')->get();
            $totalVotes = $candidates->sum('votes_count');

            return [
                'id' => $position->id,
                'name' => $position->name,
                'candidates' => $candidates->map(function ($candidate) use ($totalVotes) {
                    return [
                        'id' => $candidate->id,
                        'name' => $candidate->name,
                        'vote_count' => $candidate->votes_count,
                        'percentage' => $totalVotes > 0 ? round(($candidate->votes_count / $totalVotes) * 100, 2) : 0,
                        'winner' => false,
                    ];
                })->sortByDesc('vote_count')->values()->map(function ($c, $idx) {
                    $c['winner'] = $idx === 0;
                    return $c;
                })->values(),
            ];
        })->values();

        return response()->json([
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $this->mapStatusToApi($election->status),
            ],
            'positions' => $positions,
            'total_votes' => $election->votes()->count(),
        ]);
    }
}
