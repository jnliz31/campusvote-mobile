<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CandidateController extends Controller
{
    public function index(Request $request)
    {
        $query = Candidate::with('election');

        if ($request->has('election_id')) {
            $query->where('election_id', $request->election_id);
        }

        $candidates = $query->orderBy('created_at', 'desc')->get();
        return response()->json($candidates);
    }

    public function show($id)
    {
        $candidate = Candidate::with('election')->findOrFail($id);
        return response()->json($candidate);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_id' => 'required|exists:elections,id',
            'name' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $candidate = Candidate::create($request->all());
        return response()->json($candidate, 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'election_id' => 'sometimes|required|exists:elections,id',
            'name' => 'sometimes|required|string|max:255',
            'position' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $candidate = Candidate::findOrFail($id);
        $candidate->update($request->all());
        return response()->json($candidate);
    }

    public function destroy($id)
    {
        $candidate = Candidate::findOrFail($id);
        $candidate->delete();
        return response()->json(['message' => 'Candidate deleted successfully']);
    }
}
