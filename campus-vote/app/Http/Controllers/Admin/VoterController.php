<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use Illuminate\Http\Request;

class VoterController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->expectsJson()) {
            return view('index');
        }

        $voters = Voter::orderBy('name')->get();
        return response()->json([
            'voters' => $voters,
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
                'message' => 'Failed to delete voter: ' . $e->getMessage(),
            ], 500);
        }
    }
}
