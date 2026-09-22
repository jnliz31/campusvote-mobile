<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        if (!request()->expectsJson()) {
            return view('index');
        }

        $announcements = Announcement::orderBy('created_at', 'desc')->get();
        return response()->json([
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $announcement = Announcement::create([
            'content' => $request->input('content')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully!',
            'announcement' => $announcement,
        ], 201);
    }

    public function edit(Announcement $announcement)
    {
        return response()->json(['announcement' => $announcement]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $announcement->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully!',
            'announcement' => $announcement,
        ]);
    }

    public function destroy(Announcement $announcement)
    {
        try {
            $announcement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Announcement deleted successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete announcement: ' . $e->getMessage(),
            ], 500);
        }
    }
}
