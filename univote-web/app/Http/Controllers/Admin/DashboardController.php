<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Organization;
use App\Models\Vote;
use App\Models\Voter;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('index');
        }

        $totalElections = Election::count();
        $activeElections = Election::where('status', 'active')->count();
        $totalVoters = Voter::count();
        $totalVotes = Vote::count();

        $organizations = Organization::orderBy('name')->get();
        $voters = Voter::withCount('votes')->get();

        $organizationStats = $organizations->map(function ($org) use ($voters) {
            $orgVoters = $voters->where('organization_id', $org->id);
            $total = $orgVoters->count();
            $voted = $orgVoters->where('votes_count', '>', 0)->count();
            $notVoted = max(0, $total - $voted);
            $percentage = $total > 0 ? round(($voted / $total) * 100, 1) : 0.0;

            $male = $orgVoters->filter(function ($v) {
                return strtolower(trim((string) $v->sex)) === 'male';
            })->count();

            $female = $orgVoters->filter(function ($v) {
                return strtolower(trim((string) $v->sex)) === 'female';
            })->count();

            $other = $orgVoters->filter(function ($v) {
                $sex = strtolower(trim((string) $v->sex));

                return $sex !== 'male' && $sex !== 'female';
            })->count();

            return [
                'id' => $org->id,
                'name' => $org->name,
                'code' => $org->code ?? $org->name,
                'total_voters' => $total,
                'voted' => $voted,
                'not_voted' => $notVoted,
                'participation_percentage' => $percentage,
                'male_voters' => $male,
                'female_voters' => $female,
                'other_voters' => $other,
            ];
        });

        // Check if there are any unassigned voters
        $unassignedVoters = $voters->whereNull('organization_id');
        if ($unassignedVoters->count() > 0) {
            $uTotal = $unassignedVoters->count();
            $uVoted = $unassignedVoters->where('votes_count', '>', 0)->count();
            $uNotVoted = max(0, $uTotal - $uVoted);
            $uPercentage = $uTotal > 0 ? round(($uVoted / $uTotal) * 100, 1) : 0.0;
            $uMale = $unassignedVoters->filter(fn ($v) => strtolower(trim((string) $v->sex)) === 'male')->count();
            $uFemale = $unassignedVoters->filter(fn ($v) => strtolower(trim((string) $v->sex)) === 'female')->count();
            $uOther = $unassignedVoters->filter(function ($v) {
                $sex = strtolower(trim((string) $v->sex));

                return $sex !== 'male' && $sex !== 'female';
            })->count();

            $organizationStats->push([
                'id' => null,
                'name' => 'Unassigned',
                'code' => 'N/A',
                'total_voters' => $uTotal,
                'voted' => $uVoted,
                'not_voted' => $uNotVoted,
                'participation_percentage' => $uPercentage,
                'male_voters' => $uMale,
                'female_voters' => $uFemale,
                'other_voters' => $uOther,
            ]);
        }

        return response()->json([
            'stats' => [
                'total_elections' => $totalElections,
                'active_elections' => $activeElections,
                'total_voters' => $totalVoters,
                'total_votes' => $totalVotes,
            ],
            'organization_stats' => $organizationStats->values(),
        ]);
    }
}
