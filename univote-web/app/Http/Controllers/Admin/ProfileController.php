<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Show the admin's profile.
     */
    public function show(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'admin' => $admin,
            ]);
        }

        return view('index');
    }

    /**
     * Update the admin's name.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $admin = Auth::guard('admin')->user();
        $admin->name = $request->name;
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'admin' => $admin,
        ]);
    }

    /**
     * Update the admin's password.
     */
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $admin = Auth::guard('admin')->user();

        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json([
                'success' => false,
                'errors' => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }

        $admin->password = Hash::make($request->password);
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Upload / update the admin's profile picture.
     */
    public function updateProfilePicture(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_picture' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $admin = Auth::guard('admin')->user();

        // Delete old picture if exists
        if ($admin->profile_picture && Storage::disk('public')->exists($admin->profile_picture)) {
            Storage::disk('public')->delete($admin->profile_picture);
        }

        // Store the new picture
        $path = $request->file('profile_picture')->store('admin-avatars', 'public');

        $admin->profile_picture = $path;
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile picture updated successfully.',
            'admin' => $admin,
            'profile_picture_url' => $admin->profile_picture_url,
        ]);
    }
}
