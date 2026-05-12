# CampusVote - Complete Setup Guide

## ✅ Setup Status: COMPLETE

The CampusVote project has been successfully configured and is ready to use.

---

## **Backend (Laravel API) - READY**

### Status
- ✅ Environment configured (`.env`)
- ✅ APP_KEY generated
- ✅ Database: `campus_vote` created and configured
- ✅ Migrations applied
- ✅ Default roles (admin, student) seeded
- ✅ Dependencies installed (production)
- ✅ Server running on `http://127.0.0.1:8000`

### Backend Configuration
**Database Details:**
```
Host: 127.0.0.1
Port: 3306
Database: campus_vote
Username: root
Password: (empty)
```

**API Endpoints Available:**
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Student/admin login
- `POST /api/auth/logout` - Logout
- `GET /api/user` - Get current user
- `GET /api/elections` - List elections
- `GET /api/elections/{id}` - Election details
- `GET /api/elections/{id}/results` - Election results
- `POST /api/votes` - Cast vote
- `GET /api/announcements` - Get announcements
- And more (see SETUP_GUIDE.md for complete list)

### How to Start Backend Server
```bash
cd campusvote-api
php artisan serve
```
Server will run on: `http://127.0.0.1:8000`

---

## **Frontend (React Native Mobile App) - READY**

### Status
- ✅ npm dependencies installed
- ✅ Expo router configured
- ✅ API configuration set
- ✅ AsyncStorage (local data) ready

### API Configuration
The mobile app is configured to connect to the backend at:
- **Web/iOS**: `http://127.0.0.1:8000/api`
- **Android Emulator**: `http://10.0.2.2:8000/api`
- **Physical Device**: Modify `campusvote-mobileapp/services/api.ts` and set your computer's IP

### How to Start Frontend App

**Start Expo Development Server:**
```bash
cd campusvote-mobileapp
npm start
```

**Then choose a platform:**
- Press `w` for web (opens in browser at `http://localhost:19000`)
- Press `a` for Android emulator
- Press `i` for iOS simulator

**Or use specific commands:**
```bash
npm run web      # Web browser
npm run android  # Android emulator
npm run ios      # iOS simulator
```

---

## **Quick Start - Full Stack**

### Terminal 1: Start Backend
```bash
cd c:\xampp\htdocs\campusvote-mobile\campusvote-api
php artisan serve
```
Wait for: `INFO  Server running on [http://127.0.0.1:8000]`

### Terminal 2: Start Frontend
```bash
cd c:\xampp\htdocs\campusvote-mobile\campusvote-mobileapp
npm start
```

Then press `w` for web or `a` for Android.

---

## **Testing the Setup**

### Test Backend API
Use Postman or similar tool to test:
```
GET http://127.0.0.1:8000/api/elections
```

### Test Frontend App
1. Start both servers
2. Open the mobile app in web/emulator
3. You should see the login screen
4. Try registration and login with test credentials

---

## **Database Roles**

Two roles are automatically seeded:
- **admin** - Can create/manage elections, candidates, announcements
- **student** - Can view elections and vote

---

## **Important Notes**

1. **Windows File Locking**: Dev dependencies (phpunit, testing tools) were skipped due to Windows Search Indexer. They're not needed for running the app.

2. **Database**: Uses MySQL via XAMPP. Ensure MySQL is running in XAMPP Control Panel.

3. **API Key**: Laravel APP_KEY is already generated in `.env`

4. **Credentials**: Default database user is `root` with empty password (XAMPP default)

5. **CORS**: Already configured in Laravel for mobile app requests

6. **Sanctum**: API token authentication is configured for user sessions

---

## **Troubleshooting**

### If Laravel server won't start
```bash
php artisan key:generate  # Regenerate key if needed
php artisan migrate       # Re-run migrations
```

### If mobile app can't connect to API
- Ensure Laravel server is running
- Check that IP addresses match in `services/api.ts`
- For physical device: Use your computer's actual IP (not 127.0.0.1)

### If npm dependencies fail
```bash
npm install
npm audit fix
```

---

## **Project Structure**

```
campusvote-mobile/
├── campusvote-api/              # Laravel Backend
│   ├── app/Models/              # Database models
│   ├── app/Http/Controllers/    # API controllers
│   ├── routes/api.php           # API routes
│   ├── database/migrations/     # DB schema
│   └── .env                     # Configuration
│
└── campusvote-mobileapp/        # React Native Frontend
    ├── app/                     # Expo Router pages
    ├── services/api.ts          # API client
    ├── context/                 # React context (auth)
    └── package.json             # Dependencies
```

---

**You're all set! Start developing! 🚀**
