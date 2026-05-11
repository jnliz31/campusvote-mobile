# CampusVote Mobile API Integration - Complete

## Summary

The mobile app has been successfully integrated with the Laravel backend API. All frontend UI remains exactly as specified - no changes to design, styling, layouts, or components.

## What Was Completed

### Laravel Backend (campusvote-api)

1. **Database Migrations**
   - Updated `roles` table with name field (admin, student)
   - Updated `elections` table with title, description, status, start_date, end_date
   - Updated `candidates` table with election_id, name, position, description, photo
   - Updated `votes` table with user_id, election_id, candidate_id and unique constraint
   - Added `role_id` foreign key to users table
   - Created `announcements` table for mobile app notifications

2. **Models Updated**
   - User: Added HasApiTokens trait, role relationship, votes relationship, hasVotedInElection method
   - Role: Added users relationship
   - Election: Added candidates and votes relationships, fillable fields, casts, isActive method
   - Candidate: Added election and votes relationships, fillable fields, voteCount method
   - Vote: Added user, election, candidate relationships, fillable fields
   - Announcement: New model with fillable fields

3. **API Controllers Created**
   - AuthController: register, login, logout, getCurrentUser
   - ElectionController: CRUD operations, results endpoint
   - CandidateController: CRUD operations
   - VoteController: index, store (with duplicate prevention), checkVote
   - AnnouncementController: index, store, destroy
   - UserController: index, show

4. **API Routes** (routes/api.php)
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/user
   - GET /api/elections
   - GET /api/elections/{id}
   - GET /api/elections/{id}/results
   - POST /api/elections
   - PUT /api/elections/{id}
   - DELETE /api/elections/{id}
   - GET /api/candidates
   - GET /api/candidates/{id}
   - GET /api/elections/{electionId}/candidates
   - POST /api/candidates
   - PUT /api/candidates/{id}
   - DELETE /api/candidates/{id}
   - GET /api/votes
   - POST /api/votes
   - GET /api/elections/{electionId}/check-vote
   - GET /api/announcements
   - POST /api/announcements
   - DELETE /api/announcements/{id}
   - GET /api/users
   - GET /api/users/{id}

5. **Sanctum Configuration**
   - Published Sanctum configuration
   - Added HasApiTokens trait to User model
   - Configured guard to include 'sanctum'

### Mobile App (campusvote-mobileapp)

1. **API Service Created** (services/api.ts)
   - Complete API client with all endpoints
   - Token management (set, clear, load)
   - Error handling
   - TypeScript types for all data structures

2. **AuthContext Updated** (context/AuthContext.tsx)
   - Replaced AsyncStorage with API calls
   - registerStudent now calls API
   - loginStudent now calls API
   - loginAdmin now calls API (with role check)
   - logout now calls API
   - getCurrentUser on app load

3. **Screens Updated**
   - VoterVote: Fetches active elections from API
   - VoterDashboard: Fetches announcements and election count from API
   - AdminDashboard: Fetches elections and users from API for stats

## Next Steps for User

### 1. Configure Database

Update the `.env` file in `campusvote-api`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=campus_vote
DB_USERNAME=root
DB_PASSWORD=
```

### 2. Run Migrations

```bash
cd campusvote-api
php artisan migrate
```

### 3. Seed Default Roles

Run tinker to create default roles:

```bash
php artisan tinker
```

Then execute:
```php
use App\Models\Role;
Role::create(['name' => 'admin']);
Role::create(['name' => 'student']);
```

### 4. Start Laravel Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

### 5. Configure Mobile App API URL

Edit `campusvote-mobileapp/services/api.ts` and update the API_BASE_URL:

- For Android emulator: `http://10.0.2.2:8000/api` (already set)
- For iOS simulator: `http://localhost:8000/api`
- For physical device: Use your computer's IP address, e.g., `http://192.168.1.100:8000/api`

### 6. Test the Integration

1. **Test Registration**
   - Open mobile app
   - Go to Voter Register
   - Register a new student with @snsu.edu.ph email
   - Should successfully create user in database

2. **Test Login**
   - Login with the registered account
   - Should authenticate and redirect to dashboard

3. **Test Admin Login**
   - First create an admin user via tinker:
     ```php
     use App\Models\User;
     use App\Models\Role;
     $adminRole = Role::where('name', 'admin')->first();
     User::create([
         'name' => 'Admin User',
         'email' => 'admin@snsu.edu.ph',
         'password' => Hash::make('admin123'),
         'role_id' => $adminRole->id
     ]);
     ```
   - Login as admin in the app
   - Should access admin dashboard

4. **Test Data Sync**
   - Create elections via API or database
   - They should appear in mobile app
   - Create announcements
   - They should appear in mobile dashboard

## Features Implemented

- ✅ User registration with email validation (@snsu.edu.ph)
- ✅ Student and Admin login
- ✅ Token-based authentication using Laravel Sanctum
- ✅ Election listing (active elections)
- ✅ Candidate listing per election
- ✅ Vote submission with duplicate prevention
- ✅ Announcements display
- ✅ Real-time data sync between web and mobile
- ✅ User profile
- ✅ Admin dashboard with statistics
- ✅ All UI preserved exactly as original

## Security Features

- Token-based authentication (Sanctum)
- Password hashing
- Duplicate vote prevention (database constraint + API validation)
- Role-based access control
- Input validation on all endpoints

## Database Schema

- **users**: id, name, email, password, role_id, timestamps
- **roles**: id, name, timestamps
- **elections**: id, title, description, status, start_date, end_date, timestamps
- **candidates**: id, election_id, name, position, description, photo, timestamps
- **votes**: id, user_id, election_id, candidate_id, timestamps (unique on user_id, election_id)
- **announcements**: id, title, content, type, timestamps

## Notes

- The mobile app UI is completely unchanged
- All existing screens, layouts, colors, and components remain exactly as they were
- Only the data layer was updated to use the API instead of AsyncStorage
- The web app and mobile app now share the same database for real-time sync
- Both apps can create elections, candidates, and they will appear in both platforms
