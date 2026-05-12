<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $voters = Voter::all();

        return response()->json($voters->map(function ($voter) {
            return [
                'id' => $voter->id,
                'name' => $voter->name,
                'email' => $voter->email,
                'role' => 'student',
                'created_at' => $voter->created_at,
            ];
        }));
    }

    public function show($id)
    {
        $voter = Voter::findOrFail($id);

        return response()->json([
            'id' => $voter->id,
            'name' => $voter->name,
            'email' => $voter->email,
            'role' => 'student',
            'created_at' => $voter->created_at,
            'votes' => $voter->votes()->with(['election', 'candidate'])->get()->map(function ($vote) {
                return [
                    'id' => $vote->id,
                    'election_id' => $vote->election_id,
                    'candidate_id' => $vote->candidate_id,
                ];
            }),
        ]);
    }
}
