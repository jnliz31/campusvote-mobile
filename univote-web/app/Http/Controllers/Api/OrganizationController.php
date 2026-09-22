<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;

class OrganizationController extends Controller
{
    public function index()
    {
        return response()->json(Organization::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']));
    }
}