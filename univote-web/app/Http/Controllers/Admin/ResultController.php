<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('index');
        }

        // Only query finished elections (exclude draft, upcoming, active, cancelled)
        $query = Election::with(['organization', 'positions.candidates.votes'])
            ->where(function ($q) {
                $q->whereIn('status', ['ended', 'closed'])
                    ->orWhere(function ($sub) {
                        $sub->whereNotIn('status', ['draft', 'upcoming', 'active', 'cancelled'])
                            ->whereNotNull('end_date')
                            ->where('end_date', '<=', now());
                    });
            });

        if ($request->filled('organization_id')) {
            $orgId = $request->query('organization_id');
            if ($orgId === 'general' || $orgId === 'unassigned') {
                $query->whereNull('organization_id');
            } else {
                $query->where('organization_id', $orgId);
            }
        }

        $elections = $query->latest('end_date')->latest('created_at')->get();

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

            $endedDate = $election->end_date ?? $election->updated_at;

            return [
                'id' => $election->id,
                'title' => $election->title,
                'description' => $election->description,
                'status' => $election->status,
                'organization_id' => $election->organization_id,
                'organization' => $election->organization ? [
                    'id' => $election->organization->id,
                    'name' => $election->organization->name,
                    'code' => $election->organization->code,
                ] : null,
                'created_at' => $election->created_at?->toIso8601String(),
                'end_date' => $endedDate ? $endedDate->toIso8601String() : null,
                'created_at_formatted' => $election->created_at ? $election->created_at->format('F j, Y — g:i A') : null,
                'end_date_formatted' => $endedDate ? $endedDate->format('F j, Y — g:i A') : null,
                'positions' => $positions,
            ];
        });

        return response()->json([
            'results' => $results,
        ]);
    }

    public function show(Election $election)
    {
        $election->load(['organization', 'positions.candidates.votes']);

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

        $endedDate = $election->end_date ?? $election->updated_at;

        return response()->json([
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'description' => $election->description,
                'status' => $election->status,
                'organization_id' => $election->organization_id,
                'organization' => $election->organization ? [
                    'id' => $election->organization->id,
                    'name' => $election->organization->name,
                    'code' => $election->organization->code,
                ] : null,
                'created_at' => $election->created_at?->toIso8601String(),
                'end_date' => $endedDate ? $endedDate->toIso8601String() : null,
                'created_at_formatted' => $election->created_at ? $election->created_at->format('F j, Y — g:i A') : null,
                'end_date_formatted' => $endedDate ? $endedDate->format('F j, Y — g:i A') : null,
                'positions' => $positions,
            ],
        ]);
    }
}
