<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::orderBy('created_at', 'desc')->get();

        return response()->json($announcements->map(function ($a) {
            return [
                'id' => $a->id,
                'title' => $a->title ?? 'Announcement',
                'content' => $a->content,
                'type' => $a->type ?? 'info',
                'created_at' => $a->created_at,
            ];
        }));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'in:info,warning,success',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $announcement = Announcement::create($request->all());

        return response()->json([
            'id' => $announcement->id,
            'title' => $announcement->title,
            'content' => $announcement->content,
            'type' => $announcement->type,
            'created_at' => $announcement->created_at,
        ], 201);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();
        return response()->json(['message' => 'Announcement deleted successfully']);
    }
}
