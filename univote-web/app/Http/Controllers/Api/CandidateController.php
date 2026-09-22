<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CandidateController extends Controller
{
    private function transformCandidate($candidate)
    {
        return [
            'id' => $candidate->id,
            'election_id' => $candidate->position->election_id,
            'name' => $candidate->name,
            'position' => $candidate->position->name,
            'description' => $candidate->description,
            'photo' => $candidate->photo,
        ];
    }

    public function index(Request $request)
    {
        $query = Candidate::with('position.election');

        if ($request->has('election_id')) {
            $query->whereHas('position', function ($q) use ($request) {
                $q->where('election_id', $request->election_id);
            });
        }

        $candidates = $query->orderBy('created_at', 'desc')->get();
        return response()->json($candidates->map(fn($c) => $this->transformCandidate($c)));
    }

    public function byElection($electionId)
    {
        $election = Election::with('positions.candidates')->findOrFail($electionId);

        $candidates = $election->positions->flatMap(function ($position) use ($election) {
            return $position->candidates->map(function ($candidate) use ($position, $election) {
                return [
                    'id' => $candidate->id,
                    'election_id' => $election->id,
                    'name' => $candidate->name,
                    'position' => $position->name,
                    'description' => $candidate->description,
                    'photo' => $candidate->photo,
                ];
            });
        });

        return response()->json($candidates->values());
    }

    public function show($id)
    {
        $candidate = Candidate::with('position.election')->findOrFail($id);
        return response()->json($this->transformCandidate($candidate));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_id' => 'required|exists:elections,id',
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Find or create position for this election
        $position = Position::firstOrCreate(
            ['election_id' => $request->election_id, 'name' => $request->position],
            ['order' => 0]
        );

        $candidate = Candidate::create([
            'position_id' => $position->id,
            'name' => $request->name,
            'description' => $request->description,
            'photo' => $request->photo,
        ]);

        return response()->json($this->transformCandidate($candidate->load('position.election')), 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'election_id' => 'sometimes|required|exists:elections,id',
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $candidate = Candidate::with('position')->findOrFail($id);
        $data = [];

        if ($request->has('name')) {
            $data['name'] = $request->name;
        }
        if ($request->has('description')) {
            $data['description'] = $request->description;
        }
        if ($request->has('photo')) {
            $data['photo'] = $request->photo;
        }

        // If position changed, find or create new position
        if ($request->has('position') || $request->has('election_id')) {
            $electionId = $request->input('election_id', $candidate->position->election_id);
            $positionName = $request->input('position', $candidate->position->name);

            $position = Position::firstOrCreate(
                ['election_id' => $electionId, 'name' => $positionName],
                ['order' => 0]
            );
            $data['position_id'] = $position->id;
        }

        $candidate->update($data);
        return response()->json($this->transformCandidate($candidate->load('position.election')));
    }

    public function destroy($id)
    {
        $candidate = Candidate::findOrFail($id);
        $candidate->delete();
        return response()->json(['message' => 'Candidate deleted successfully']);
    }
}
