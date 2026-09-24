<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function index()
    {
        if (!request()->expectsJson()) {
            return view('index');
        }

        $announcements = Announcement::with(['organization', 'admin'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'content' => $a->content,
                    'type' => $a->type,
                    'organization_id' => $a->organization_id,
                    'organization' => $a->organization ? [
                        'id' => $a->organization->id,
                        'name' => $a->organization->name,
                        'code' => $a->organization->code,
                    ] : null,
                    'admin_id' => $a->admin_id,
                    'admin' => $a->admin ? [
                        'id' => $a->admin->id,
                        'name' => $a->admin->name,
                    ] : null,
                    'created_at' => $a->created_at,
                    'updated_at' => $a->updated_at,
                ];
            });

        $organizations = Organization::orderBy('name')->get(['id', 'name', 'code']);

        return response()->json([
            'announcements' => $announcements,
            'organizations' => $organizations,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'title' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:info,warning,success',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        $admin = Auth::guard('admin')->user();

        $announcement = Announcement::create([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'type' => $request->input('type', 'info'),
            'organization_id' => $request->input('organization_id'),
            'admin_id' => $admin?->id,
        ]);

        $announcement->load(['organization', 'admin']);

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully!',
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'type' => $announcement->type,
                'organization_id' => $announcement->organization_id,
                'organization' => $announcement->organization ? [
                    'id' => $announcement->organization->id,
                    'name' => $announcement->organization->name,
                    'code' => $announcement->organization->code,
                ] : null,
                'admin_id' => $announcement->admin_id,
                'admin' => $announcement->admin ? [
                    'id' => $announcement->admin->id,
                    'name' => $announcement->admin->name,
                ] : null,
                'created_at' => $announcement->created_at,
            ],
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
            'title' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:info,warning,success',
            'organization_id' => 'nullable|exists:organizations,id',
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
