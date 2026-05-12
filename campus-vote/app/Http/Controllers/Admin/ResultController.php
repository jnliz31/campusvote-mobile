<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->expectsJson()) {
            return view('index');
        }

        $elections = Election::with(['positions.candidates.votes'])->get();

        $results = $elections->map(function ($election) {
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
                        ];
                    })->sortByDesc('vote_count')->values(),
                ];
            })->values();

            return [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status,
                'positions' => $positions,
            ];
        });

        return response()->json([
            'results' => $results,
        ]);
    }

    public function show(Election $election)
    {
        $election->load(['positions.candidates.votes']);

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
                    ];
                })->sortByDesc('vote_count')->values(),
            ];
        })->values();

        return response()->json([
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'positions' => $positions,
            ]
        ]);
    }
}
