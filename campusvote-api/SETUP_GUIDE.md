# CampusVote Mobile API Setup Guide

## Database Configuration

To connect to the existing MySQL database "campus_vote", update the `.env` file in the Laravel backend:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=campus_vote
DB_USERNAME=root
DB_PASSWORD=
```

## Run Migrations

After configuring the database, run the migrations:

```bash
cd campusvote-api
php artisan migrate
```

## Create Default Roles

After migrations, seed the default roles:

```bash
php artisan tinker
```

Then run:
```php
use App\Models\Role;
Role::create(['name' => 'admin']);
Role::create(['name' => 'student']);
```

## API Endpoints

The API will be available at: `http://localhost:8000/api`

### Authentication Endpoints
- POST `/api/auth/register` - Register new student
- POST `/api/auth/login` - Login (student or admin)
- POST `/api/auth/logout` - Logout

### Election Endpoints
- GET `/api/elections` - List all elections
- GET `/api/elections/{id}` - Get election details with candidates
- POST `/api/elections` - Create election (admin only)
- PUT `/api/elections/{id}` - Update election (admin only)
- DELETE `/api/elections/{id}` - Delete election (admin only)

### Candidate Endpoints
- GET `/api/elections/{electionId}/candidates` - List candidates for an election
- POST `/api/candidates` - Create candidate (admin only)
- PUT `/api/candidates/{id}` - Update candidate (admin only)
- DELETE `/api/candidates/{id}` - Delete candidate (admin only)

### Voting Endpoints
- POST `/api/votes` - Cast a vote
- GET `/api/votes` - Get user's voting history
- GET `/api/elections/{id}/results` - Get election results

### Announcement Endpoints
- GET `/api/announcements` - List all announcements
- POST `/api/announcements` - Create announcement (admin only)

### User Endpoints
- GET `/api/user` - Get current user profile
- GET `/api/users` - List all users (admin only)

## Mobile App Configuration

Update the API base URL in the mobile app's API service:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

Replace `localhost` with your actual server IP when testing on a physical device.
