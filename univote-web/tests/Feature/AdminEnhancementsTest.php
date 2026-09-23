<?php

use App\Models\Admin;
use App\Models\Election;
use App\Models\Organization;
use App\Models\Voter;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = Admin::firstOrCreate(
        ['email' => 'testadmin@univote.edu'],
        ['name' => 'Test Admin', 'password' => bcrypt('password123')]
    );
});

test('admin dashboard returns organization voter statistics with participation and demographics', function () {
    // Arrange test organization and voters
    $org = Organization::firstOrCreate(
        ['code' => 'TEST_ORG'],
        ['name' => 'Test Organization', 'is_active' => true]
    );

    $voterMale = Voter::firstOrCreate(
        ['email' => 'male_voter@test.edu'],
        [
            'name' => 'Male Voter',
            'password' => bcrypt('secret'),
            'age' => 20,
            'sex' => 'Male',
            'course' => 'BSCS',
            'organization_id' => $org->id,
        ]
    );

    $voterFemale = Voter::firstOrCreate(
        ['email' => 'female_voter@test.edu'],
        [
            'name' => 'Female Voter',
            'password' => bcrypt('secret'),
            'age' => 21,
            'sex' => 'Female',
            'course' => 'BSIT',
            'organization_id' => $org->id,
        ]
    );

    $response = $this->actingAs($this->admin, 'admin')->getJson('/admin/dashboard');

    $response->assertOk();
    $response->assertJsonStructure([
        'stats' => ['total_elections', 'active_elections', 'total_voters', 'total_votes'],
        'organization_stats' => [
            '*' => [
                'id',
                'name',
                'code',
                'total_voters',
                'voted',
                'not_voted',
                'participation_percentage',
                'male_voters',
                'female_voters',
                'other_voters',
            ],
        ],
    ]);

    $orgStats = collect($response->json('organization_stats'))->firstWhere('code', 'TEST_ORG');
    expect($orgStats)->not->toBeNull();
    expect($orgStats['total_voters'])->toBeGreaterThanOrEqual(2);
    expect($orgStats['male_voters'])->toBeGreaterThanOrEqual(1);
    expect($orgStats['female_voters'])->toBeGreaterThanOrEqual(1);
});

test('admin voters index returns voting status and supports organization filtering', function () {
    $org = Organization::firstOrCreate(
        ['code' => 'VOTE_ORG'],
        ['name' => 'Voters Test Organization', 'is_active' => true]
    );

    $voter = Voter::firstOrCreate(
        ['email' => 'status_voter@test.edu'],
        [
            'name' => 'Status Voter',
            'password' => bcrypt('secret'),
            'age' => 22,
            'sex' => 'Other',
            'course' => 'BSCE',
            'organization_id' => $org->id,
        ]
    );

    $response = $this->actingAs($this->admin, 'admin')->getJson('/admin/voters');

    $response->assertOk();
    $response->assertJsonStructure([
        'voters' => [
            '*' => ['id', 'name', 'email', 'age', 'sex', 'course', 'organization_id', 'has_voted'],
        ],
    ]);

    // Test filtering by organization
    $filteredResponse = $this->actingAs($this->admin, 'admin')->getJson('/admin/voters?organization_id='.$org->id);
    $filteredResponse->assertOk();
    $votersInOrg = $filteredResponse->json('voters');
    foreach ($votersInOrg as $item) {
        expect($item['organization_id'])->toBe($org->id);
    }
});

test('admin can update voter demographic and organization details safely without overwriting auth or vote history', function () {
    $org1 = Organization::firstOrCreate(
        ['code' => 'ORG_A'],
        ['name' => 'Org A', 'is_active' => true]
    );
    $org2 = Organization::firstOrCreate(
        ['code' => 'ORG_B'],
        ['name' => 'Org B', 'is_active' => true]
    );

    $originalPassword = bcrypt('supersecret');
    $voter = Voter::create([
        'name' => 'Original Name',
        'email' => 'edit_test_'.uniqid().'@test.edu',
        'password' => $originalPassword,
        'age' => 19,
        'sex' => 'Male',
        'course' => 'BS Biology',
        'organization_id' => $org1->id,
    ]);

    // Test form validation: Name is required
    $invalidResponse = $this->actingAs($this->admin, 'admin')->putJson("/admin/voters/{$voter->id}", [
        'name' => '',
    ]);
    $invalidResponse->assertUnprocessable();

    // Test form validation: Invalid age (< 15)
    $invalidAgeResponse = $this->actingAs($this->admin, 'admin')->putJson("/admin/voters/{$voter->id}", [
        'name' => 'Valid Name',
        'age' => 10,
    ]);
    $invalidAgeResponse->assertUnprocessable();

    // Test form validation: Invalid sex
    $invalidSexResponse = $this->actingAs($this->admin, 'admin')->putJson("/admin/voters/{$voter->id}", [
        'name' => 'Valid Name',
        'sex' => 'InvalidGenderChoice',
    ]);
    $invalidSexResponse->assertUnprocessable();

    // Valid update
    $validResponse = $this->actingAs($this->admin, 'admin')->putJson("/admin/voters/{$voter->id}", [
        'name' => 'Updated Jane Doe',
        'age' => 23,
        'sex' => 'Female',
        'course' => 'BS Information Systems',
        'organization_id' => $org2->id,
    ]);

    $validResponse->assertOk();
    $validResponse->assertJsonPath('voter.name', 'Updated Jane Doe');
    $validResponse->assertJsonPath('voter.age', 23);
    $validResponse->assertJsonPath('voter.sex', 'Female');
    $validResponse->assertJsonPath('voter.course', 'BS Information Systems');
    $validResponse->assertJsonPath('voter.organization_id', $org2->id);

    // Verify database record & ensure password/email were preserved
    $freshVoter = $voter->fresh();
    expect($freshVoter->name)->toBe('Updated Jane Doe');
    expect($freshVoter->password)->toBe($originalPassword);
    expect($freshVoter->email)->toBe($voter->email);
});

test('admin results endpoint only returns finished elections and includes formatted dates and organization info', function () {
    $org = Organization::firstOrCreate(
        ['code' => 'RESULTS_ORG'],
        ['name' => 'Results Org', 'is_active' => true]
    );

    // Create an active election (must NOT appear in results)
    $activeElection = Election::create([
        'title' => 'Active Election '.uniqid(),
        'status' => 'active',
        'organization_id' => $org->id,
    ]);

    // Create a finished election (must appear in results)
    $finishedElection = Election::create([
        'title' => 'Concluded Election '.uniqid(),
        'status' => 'ended',
        'organization_id' => $org->id,
        'start_date' => now()->subDays(2),
        'end_date' => now()->subDay(),
    ]);

    $response = $this->actingAs($this->admin, 'admin')->getJson('/admin/results');

    $response->assertOk();
    $results = collect($response->json('results'));

    // Verify only finished election appears, active election does not
    expect($results->pluck('id')->contains($activeElection->id))->toBeFalse();
    expect($results->pluck('id')->contains($finishedElection->id))->toBeTrue();

    // Verify election data includes organization and formatted timestamps
    $found = $results->firstWhere('id', $finishedElection->id);
    expect($found)->not->toBeNull();
    expect($found['status'])->toBe('ended');
    expect($found['organization'])->not->toBeNull();
    expect($found['organization']['code'])->toBe('RESULTS_ORG');
    expect($found['created_at_formatted'])->not->toBeNull();
    expect($found['end_date_formatted'])->not->toBeNull();
});
