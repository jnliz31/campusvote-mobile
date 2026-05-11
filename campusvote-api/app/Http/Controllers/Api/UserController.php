<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role')->get();
        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::with('role', 'votes')->findOrFail($id);
        return response()->json($user);
    }
}
