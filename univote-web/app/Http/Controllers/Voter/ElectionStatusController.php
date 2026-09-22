<?php

namespace App\Http\Controllers\Voter;

use App\Models\Election;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ElectionStatusController extends Controller
{
    /**
     * Get the current election status
     */
    public function status()
    {
        $election = Election::with(['positions.candidates.votes'])->first();

        if (!$election) {
            return response()->json([
                'status' => 'no_election',
                'message' => 'No election found',
            ]);
        }

        $voter = Auth::guard('voter')->user();
        $hasVoted = Vote::where('voter_id', $voter->id)
            ->where('election_id', $election->id)
            ->exists();

        return response()->json([
            'election_id' => $election->id,
            'title' => $election->title,
            'status' => $election->status,
            'has_voted' => $hasVoted,
            'total_votes_cast' => $election->votes()->count(),
        ]);
    }

    /**
     * Get election results
     */
    public function results()
    {
        $election = Election::with(['positions.candidates.votes'])->first();

        if (!$election) {
            return response()->json([
                'status' => 'no_election',
                'results' => [],
            ]);
        }

        $results = [];

        foreach ($election->positions as $position) {
            $candidates = $position->candidates()->withCount('votes')->get();
            $totalVotes = $candidates->sum('votes_count');

            $results[$position->name] = $candidates->map(function ($candidate) use ($totalVotes) {
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'votes' => $candidate->votes_count,
                    'percentage' => $totalVotes > 0 ? round(($candidate->votes_count / $totalVotes) * 100, 2) : 0,
                ];
            })->sortByDesc('votes')->values();
        }

        return response()->json([
            'election_id' => $election->id,
            'election_title' => $election->title,
            'status' => $election->status,
            'results' => $results,
            'total_votes' => $election->votes()->count(),
        ]);
    }

    /**
     * Get live updates on election status (Server-Sent Events)
     */
    public function liveUpdates()
    {
        return response()->stream(function () {
            while (true) {
                $election = Election::find(request('election_id'));

                if ($election) {
                    echo "data: " . json_encode([
                        'status' => $election->status,
                        'votes_count' => $election->votes()->count(),
                        'timestamp' => now()->toDateTimeString(),
                    ]) . "\n\n";
                }

                sleep(5); // Update every 5 seconds
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
