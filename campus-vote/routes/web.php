<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ResultController;
use App\Http\Controllers\Voter\VotingController;
use App\Http\Controllers\Voter\ElectionStatusController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\VoterAuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Auth\VoterRegistrationController;
use App\Http\Controllers\Admin\VoterController as AdminVoterController;

/*
|--------------------------------------------------------------------------
| Guest Routes (Landing & Login Pages)
|--------------------------------------------------------------------------
*/

// Landing page - serve SPA
Route::get('/', function () {
    return view('index');
});

/*
|--------------------------------------------------------------------------
| Voter Authentication Routes
|--------------------------------------------------------------------------
*/

Route::prefix('voter')->group(function () {
    // Auth check (always available)
    Route::get('auth/check', [VoterAuthController::class, 'check'])->name('voter.auth.check');

    // Guest routes (not logged in)
    Route::middleware('guest:voter')->group(function () {
        // Login
        Route::get('login', [VoterAuthController::class, 'showLogin'])->name('voter.login');
        Route::post('login', [VoterAuthController::class, 'login']);

        // Google OAuth Routes
        Route::get('auth/google', [GoogleAuthController::class, 'redirect'])->name('voter.google.redirect');
        Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('voter.google.callback');

        // Registration (backup method)
        Route::get('register', [VoterRegistrationController::class, 'showRegistrationForm'])->name('voter.register.form');
        Route::post('register', [VoterRegistrationController::class, 'register'])->name('voter.register');
    });

    // Authenticated routes (logged in)
    Route::middleware('auth:voter')->group(function () {
        Route::post('logout', [VoterAuthController::class, 'logout'])->name('voter.logout');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Authentication Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {
    // Auth check (always available)
    Route::get('auth/check', [AdminAuthController::class, 'check'])->name('admin.auth.check');

    // Guest routes (not logged in)
    Route::middleware('guest:admin')->group(function () {
        Route::get('login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
        Route::post('login', [AdminAuthController::class, 'login']);
    });

    // Authenticated routes (logged in)
    Route::middleware('auth:admin')->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
    });
});

/*
|--------------------------------------------------------------------------
| Voter Protected Routes
|--------------------------------------------------------------------------
*/

Route::prefix('voter')->middleware(['auth:voter'])->group(function () {
    Route::get('dashboard', [VotingController::class, 'dashboard'])->name('voter.dashboard');
    Route::get('vote', [VotingController::class, 'vote'])->name('voter.vote');
    Route::post('vote', [VotingController::class, 'submitVote'])->name('voter.submit');
    Route::get('votes', [VotingController::class, 'showVotes'])->name('voter.votes');
    Route::get('results', [VotingController::class, 'results'])->name('voter.results');
    Route::get('profile', [VotingController::class, 'profile'])->name('voter.profile');
    Route::put('profile', [VotingController::class, 'updateProfile'])->name('voter.profile.update');

    // API routes for real-time updates
    Route::prefix('api')->group(function () {
        Route::get('election/status', [ElectionStatusController::class, 'status'])->name('voter.api.status');
        Route::get('election/results', [ElectionStatusController::class, 'results'])->name('voter.api.results');
        Route::get('election/live', [ElectionStatusController::class, 'liveUpdates'])->name('voter.api.live');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Protected Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware('auth:admin')->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Elections Management
    Route::controller(ElectionController::class)->group(function () {
        Route::get('elections', 'index')->name('admin.elections.index');
        Route::get('elections/create', 'create')->name('admin.elections.create');
        Route::post('elections', 'store')->name('admin.elections.store');
        Route::get('elections/{election}/edit', 'edit')->name('admin.elections.edit');
        Route::put('elections/{election}', 'update')->name('admin.elections.update');
        Route::post('elections/{election}/end', 'endElection')->name('admin.elections.end');
        Route::delete('elections/{election}', 'destroy')->name('admin.elections.destroy');
    });

    // Voters Management
    Route::controller(AdminVoterController::class)->group(function () {
        Route::get('voters', 'index')->name('admin.voters.index');
        Route::delete('voters/{voter}', 'destroy')->name('admin.voters.destroy');
    });

    // Results
    Route::controller(ResultController::class)->group(function () {
        Route::get('results', 'index')->name('admin.results.index');
        Route::get('results/{election}', 'show')->name('admin.results.show');
    });

    // Announcements
    Route::controller(AnnouncementController::class)->group(function () {
        Route::get('announcements', 'index')->name('admin.announcements.index');
        Route::post('announcements', 'store')->name('admin.announcements.store');
        Route::get('announcements/{announcement}/edit', 'edit')->name('admin.announcements.edit');
        Route::put('announcements/{announcement}', 'update')->name('admin.announcements.update');
        Route::delete('announcements/{announcement}', 'destroy')->name('admin.announcements.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| SPA Catch-All Route  (must be last)
|--------------------------------------------------------------------------
*/
// Serve Vue SPA for all unmatched routes
Route::fallback(function () {
    return view('index');
});
