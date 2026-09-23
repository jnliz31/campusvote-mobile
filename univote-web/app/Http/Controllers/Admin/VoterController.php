<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use Illuminate\Http\Request;

class VoterController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return view('index');
        }

        $query = Voter::with('organization')->withCount('votes')->orderBy('name');

        if ($request->filled('organization_id')) {
            $orgId = $request->query('organization_id');
            if ($orgId === 'unassigned') {
                $query->whereNull('organization_id');
            } else {
                $query->where('organization_id', $orgId);
            }
        }

        $voters = $query->get()->map(function ($voter) {
            $voter->has_voted = $voter->votes_count > 0;

            return $voter;
        });

        return response()->json([
            'voters' => $voters,
        ]);
    }

    public function update(Request $request, Voter $voter)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'nullable|integer|min:15|max:120',
            'sex' => 'nullable|string|in:Male,Female,Other,male,female,other',
            'course' => 'nullable|string|max:255',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        $sex = null;
        if (! empty($validated['sex'])) {
            $normalizedSex = strtolower(trim($validated['sex']));
            if (in_array($normalizedSex, ['male', 'female', 'other'])) {
                $sex = ucfirst($normalizedSex);
            }
        }

        // Strictly update only safe profile attributes without touching auth/login data or voting history
        $voter->update([
            'name' => $validated['name'],
            'age' => $validated['age'] ?? null,
            'sex' => $sex,
            'course' => $validated['course'] ?? null,
            'organization_id' => $validated['organization_id'] ?? null,
        ]);

        $updatedVoter = $voter->fresh(['organization']);
        $updatedVoter->loadCount('votes');
        $updatedVoter->has_voted = $updatedVoter->votes_count > 0;

        return response()->json([
            'success' => true,
            'message' => 'Voter updated successfully!',
            'voter' => $updatedVoter,
        ]);
    }

    public function destroy(Voter $voter)
    {
        try {
            $voter->delete();

            return response()->json([
                'success' => true,
                'message' => 'Voter deleted successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete voter: '.$e->getMessage(),
            ], 500);
        }
    }
}
