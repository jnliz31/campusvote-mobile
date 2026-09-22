<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function index()
    {
        if (!request()->expectsJson()) {
            return view('index');
        }

        return response()->json(['organizations' => Organization::withCount('voters')->orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:organizations,name',
            'code' => 'required|string|max:20|alpha_dash|unique:organizations,code',
        ]);

        $data['code'] = strtoupper($data['code']);

        return response()->json(['organization' => Organization::create($data)], 201);
    }

    public function update(Request $request, Organization $organization)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:organizations,name,' . $organization->id,
            'code' => 'required|string|max:20|alpha_dash|unique:organizations,code,' . $organization->id,
            'is_active' => 'sometimes|boolean',
        ]);

        $data['code'] = strtoupper($data['code']);

        $organization->update($data);
        return response()->json(['organization' => $organization->fresh()]);
    }

    public function destroy(Organization $organization)
    {
        if ($organization->voters()->exists() || $organization->elections()->exists()) {
            return response()->json(['message' => 'This organization is assigned to voters or elections and cannot be deleted.'], 422);
        }

        $organization->delete();
        return response()->json(['message' => 'Organization deleted successfully.']);
    }
}