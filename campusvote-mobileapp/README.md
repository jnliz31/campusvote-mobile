# CampusVote — SNSU Online Voting System

A mobile voting system built with **React Native + Expo Router** (file-based routing).

---

## � Prerequisites

Before you begin, make sure your system has all required software installed:

### For All Users:
- **Git** - [Download](https://git-scm.com/)
  - Verify: `git --version`
  
- **Node.js v18+** - [Download](https://nodejs.org/)
  - Verify: `node --version` and `npm --version`
  - Come with npm (Node Package Manager)

### Backend Requirements (Laravel API):
- **PHP 8.2+** - [Download](https://www.php.net/downloads)
  - Or use **XAMPP** (includes PHP + MySQL) - [Download](https://www.apachefriends.org/)
  - Verify: `php --version`

- **Composer** (PHP package manager) - [Download](https://getcomposer.org/)
  - Verify: `composer --version`

- **MySQL 8.0+** (Database)
  - Included in XAMPP
  - Or install separately - [Download](https://www.mysql.com/downloads/mysql/)
  - Verify: `mysql --version`

### Mobile Testing:
- **Expo Go App** (for running on your phone)
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional (for emulators):
- **Android Studio** (for Android emulator) - [Download](https://developer.android.com/studio)
- **Xcode** (for iOS simulator on macOS) - [Download from App Store](https://apps.apple.com/app/xcode/id497799835)

### Verification Checklist
Run these commands in your terminal to verify everything is installed:

```bash
# Check Git
git --version
# Expected: git version 2.x.x

# Check Node
node --version
# Expected: v18.x.x or higher

# Check npm
npm --version
# Expected: 8.x.x or higher

# Check PHP (if doing backend development)
php --version
# Expected: PHP 8.2.x or higher

# Check Composer (if doing backend development)
composer --version
# Expected: Composer version 2.x.x
```

If any of these commands fail, install the missing software from the links above.

---

## 🔄 Clone the Repository

This project consists of **two parts**:
- **Backend**: Laravel API (`campus-vote/`)
- **Frontend**: React Native Mobile App (`campusvote-mobileapp/`)

Both are in the same parent directory: `campusvote-mobile/`

### Option 1: Clone using HTTPS (Recommended for beginners)
```bash
# Clone the entire project
git clone https://github.com/your-username/campusvote-mobile.git
cd campusvote-mobile

# You'll now see two folders:
# - campus-vote/ (Laravel backend)
# - campusvote-mobileapp/ (React Native mobile app)
```

### Option 2: Clone using SSH (if you have SSH keys configured)
```bash
git clone git@github.com:your-username/campusvote-mobile.git
cd campusvote-mobile
```

### Option 3: Using GitHub CLI
```bash
gh repo clone your-username/campusvote-mobile
cd campusvote-mobile
```

### Option 4: Download as ZIP
1. Visit [GitHub Repository](https://github.com/your-username/campusvote-mobile)
2. Click **Code** → **Download ZIP**
3. Extract the ZIP file to your desired location
4. Navigate into the folder: `cd campusvote-mobile`

---

## ⚠️ Important: Choose Your Working Directory

**Windows users**: Avoid spaces in folder paths. Use one of these:
- ✅ `C:\Users\YourName\Desktop\campusvote-mobile`
- ✅ `C:\Dev\campusvote-mobile`
- ❌ `C:\Users\YourName\My Documents\campusvote-mobile` (has spaces)

**macOS/Linux users**: Standard paths work fine
- ✅ `~/Documents/campusvote-mobile`
- ✅ `/opt/projects/campusvote-mobile`

---

## 📁 Project Structure

```
CampusVote/
├── app/
│   ├── _layout.tsx              ← Root layout + auth guard
│   ├── +not-found.tsx           ← 404 screen
│   ├── (auth)/
│   │   ├── _layout.tsx          ← Auth stack navigator
│   │   ├── VoterLogin.tsx       ← Student login screen
│   │   ├── VoterRegister.tsx    ← Student registration screen
│   │   └── AdminLogin.tsx       ← Admin login screen
│   └── (tabs)/
│       ├── _layout.tsx          ← Tab bar (student OR admin tabs)
│       ├── index.tsx            ← Tab home screen
│       ├── (voter)/
│       │   ├── VoterDashboard.tsx   ← Student: Dashboard
│       │   ├── VoterVote.tsx        ← Student: Vote
│       │   ├── VoterVotes.tsx       ← Student: Vote history
│       │   ├── VoterResults.tsx     ← Student: Results
│       │   └── VoterProfile.tsx     ← Student: Profile + Logout
│       └── (admin)/
│           ├── AdminDashboard.tsx    ← Admin: Dashboard
│           ├── AdminVoters.tsx       ← Admin: Voter management
│           ├── AdminElections.tsx    ← Admin: Election management
│           ├── AdminCreateElection.tsx ← Admin: Create election
│           ├── AdminEditElection.tsx   ← Admin: Edit election
│           ├── AdminAnnouncements.tsx  ← Admin: Announcements
│           ├── AdminResults.tsx       ← Admin: Results
│           └── AdminProfile.tsx       ← Admin: Profile + Logout
├── context/
│   └── AuthContext.tsx          ← Auth state + AsyncStorage
├── constants/
│   └── Colors.ts                ← Color palette
├── hooks/
│   └── useStoredStudents.ts     ← Students data hook
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── eslint.config.js
└── README.md
```

---

## 🚀 Complete Setup & Run Guide

### Part 1: Backend Setup (Laravel API)

The mobile app requires the Laravel backend to be running. Follow these steps first:

#### Step 1.1: Navigate to Backend Directory
```bash
cd campusvote-mobile
cd campus-vote
```

#### Step 1.2: Install PHP Dependencies
```bash
# Using Composer (ensure PHP 8.2+ is installed)
composer install
```

#### Step 1.3: Create Environment File
```bash
# Copy the example environment file
cp .env.example .env
# Or on Windows PowerShell:
# Copy-Item .env.example .env
```

#### Step 1.4: Generate Application Key
```bash
php artisan key:generate
```

#### Step 1.5: Configure Database
Edit the `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=campusvote
DB_USERNAME=root
DB_PASSWORD=
```

**If using XAMPP:**
1. Start XAMPP (Apache & MySQL)
2. Open phpMyAdmin: `http://localhost/phpmyadmin`
3. Create a new database: `CREATE DATABASE campusvote;`

#### Step 1.6: Run Database Migrations
```bash
php artisan migrate
```

#### Step 1.7: Seed Database (Optional - adds sample data)
```bash
php artisan db:seed
```

#### Step 1.8: Start Laravel Development Server
```bash
# Start on port 8000, accessible from network
php artisan serve --host=0.0.0.0 --port=8000
```

You should see:
```
INFO  Server running on [http://0.0.0.0:8000].
```

> ⚠️ **Keep this terminal window open** — the backend must be running while you use the mobile app.

---

### Part 2: Mobile App Setup (React Native)

#### Step 2.1: Navigate to Mobile App Directory
```bash
# From parent directory (campusvote-mobile/)
cd campusvote-mobileapp
```

#### Step 2.2: Install Node Dependencies
```bash
npm install
```

If you encounter issues, try clearing cache first:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Step 2.3: Configure API Connection

**For Physical Device Testing:**

1. Find your computer's local IP address:

   **Windows (PowerShell):**
   ```powershell
   ipconfig
   # Look for "IPv4 Address" (usually 192.168.x.x or 10.0.x.x)
   ```

   **macOS/Linux (Terminal):**
   ```bash
   ifconfig
   # Look for "inet addr" on your active network interface
   ```

2. Open `campusvote-mobileapp/services/api.ts`

3. Update the API_BASE_URL:
   ```typescript
   let API_BASE_URL = "http://YOUR_IP_ADDRESS:8000/api";
   // Example: "http://192.168.0.106:8000/api"
   ```

**For Android Emulator Testing:**
```typescript
let API_BASE_URL = "http://10.0.2.2:8000/api"; // Special emulator IP
```

**For iOS Simulator Testing (macOS):**
```typescript
let API_BASE_URL = "http://127.0.0.1:8000/api"; // Localhost
```

#### Step 2.4: Start Expo Development Server
```bash
npx expo start
```

You should see output like:
```
Expo server is running on:
  ▌ Local:   exp://127.0.0.1:19000
  ▌ LAN:     exp://192.168.0.106:19000
```

> ⚠️ **Windows users**: If you get "no spaces in path" error, ensure your folder path has NO SPACES.

#### Step 2.5: Run on Device/Emulator

**Option A: Android Physical Device**
1. Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) on your phone
2. Open Expo Go app
3. Scan the QR code shown in terminal
4. App loads and connects to your backend

**Option B: Android Emulator**
1. Open Android Studio and start an emulator
2. In terminal, press `a` to run on emulator
3. Wait for app to build and load

**Option C: iOS Simulator (macOS only)**
1. Have Xcode installed with iOS simulators
2. In terminal, press `i` to run on simulator

**Option D: Web Browser (for testing UI only)**
1. In terminal, press `w`
2. App opens in browser (limited functionality)

**Option E: Manual QR Code Scanning**
1. Get the QR code from terminal output
2. Use phone camera or Expo Go app to scan
3. App launches automatically

---

### Part 3: Verify Everything Works

#### Step 3.1: Test Backend Connection
```bash
# From another terminal, test the health endpoint
curl http://YOUR_IP_ADDRESS:8000/api/health
# Should return: {"status":"ok","message":"API is running"}
```

#### Step 3.2: Test Mobile App Login
1. In the app, go to **Student Login**
2. Test Register with any `@snsu.edu.ph` email
3. Login with your new credentials
4. If successful, you're ready to use the app!

#### Step 3.3: Test Admin Login (Optional)
1. Go to **Admin Login**
2. Email: `admin@snsu.edu.ph`
3. Password: `admin123`

---

### Quick Reference: Running Everything

**Terminal 1 (Backend):**
```bash
cd campusvote-mobile/campus-vote
php artisan serve --host=0.0.0.0 --port=8000
```

**Terminal 2 (Mobile App):**
```bash
cd campusvote-mobile/campusvote-mobileapp
npx expo start
```

**Terminal 3 (Optional - to run commands):**
```bash
cd campusvote-mobile
# Any project management commands
```

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start Expo (no spaces in path!)
```bash
npx expo start
```

> ⚠️ **Windows users**: Make sure there are NO spaces in the folder path.
> Move to `C:\Users\YOUR_USERNAME\Desktop\CampusVote` (not `CampusVote-Mobile app`).

### 3. Run on Device/Emulator

Scan the QR code with **Expo Go** on Android/iOS, or press:
- `a` → Android emulator  
- `i` → iOS simulator  
- `w` → Web browser
- `j` → Debug menu

---

## 🔐 Authentication

### Default Admin Credentials
| Field    | Value               |
|----------|---------------------|
| Email    | admin@snsu.edu.ph   |
| Password | admin123            |

### Student Registration Rules
- Email **must** end with `@snsu.edu.ph`
- Password minimum 6 characters
- All fields required

---

## 🔄 Auth Flow (Auto-redirect)

The root `app/_layout.tsx` acts as an **auth guard**:

```
Not logged in    → /(auth)/student-login
Logged in student → /(tabs)/          (Home tab)
Logged in admin   → /(tabs)/admin-dashboard
```

Tabs are **conditionally shown** — students see 4 student tabs, admins see 4 admin tabs.

---

## 📱 Screens Overview

### Auth Screens
| File | Route | Description |
|------|-------|-------------|
| `(auth)/VoterLogin.tsx` | `/VoterLogin` | Student login with email & password |
| `(auth)/VoterRegister.tsx` | `/VoterRegister` | Student registration with password strength meter |
| `(auth)/AdminLogin.tsx` | `/AdminLogin` | Admin login with default credentials |

### Student (Voter) Screens
| File | Description |
|------|-------------|
| `(tabs)/(voter)/VoterDashboard.tsx` | Dashboard with voting status & active elections |
| `(tabs)/(voter)/VoterVote.tsx` | Vote in elections interface |
| `(tabs)/(voter)/VoterVotes.tsx` | View voting history |
| `(tabs)/(voter)/VoterResults.tsx` | View live election results |
| `(tabs)/(voter)/VoterProfile.tsx` | Account info & logout |

### Admin Screens
| File | Description |
|------|-------------|
| `(tabs)/(admin)/AdminDashboard.tsx` | Dashboard with stats & turnout |
| `(tabs)/(admin)/AdminVoters.tsx` | Manage voter accounts |
| `(tabs)/(admin)/AdminElections.tsx` | List & manage elections |
| `(tabs)/(admin)/AdminCreateElection.tsx` | Create new election |
| `(tabs)/(admin)/AdminEditElection.tsx` | Edit existing election |
| `(tabs)/(admin)/AdminAnnouncements.tsx` | Post announcements |
| `(tabs)/(admin)/AdminResults.tsx` | View detailed results |
| `(tabs)/(admin)/AdminProfile.tsx` | Admin info & logout |

---

## 🔐 Authentication

### Default Admin Credentials
| Field    | Value               |
|----------|---------------------|
| Email    | admin@snsu.edu.ph   |
| Password | admin123            |

### Student Registration Rules
- Email **must** end with `@snsu.edu.ph`
- Password minimum 6 characters
- All fields required

---

## 🔄 Auth Flow (Auto-redirect)

The root `app/_layout.tsx` acts as an **auth guard**:

```
Not logged in    → /(auth)/VoterLogin
Logged in student → /(tabs)/(voter)/VoterDashboard
Logged in admin   → /(tabs)/(admin)/AdminDashboard
```

Tabs are **conditionally shown** — students see voter tabs, admins see admin tabs.

---

## 💾 AsyncStorage Keys

| Key | Contents |
|-----|----------|
| `cv_students` | Array of registered student accounts |
| `cv_admins` | Array of admin accounts |
| `cv_current_user` | Currently logged-in session |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary (Student) | `#1B5E20` dark green |
| Primary Light | `#2E7D32` |
| Admin Primary | `#1a237e` navy |
| Background | `#F5F7F5` |
| Card | `#ffffff` |
| Text | `#333333` |
| Text Muted | `#999999` |
| Border | `#e0e0e0` |
| Success | `#4caf50` |
| Warning | `#ff9800` |
| Error | `#f44336` |

---

## ✅ Features

- [x] Functional student registration & login
- [x] Functional admin login (default credentials)
- [x] Session persistence via AsyncStorage
- [x] Auto-redirect auth guard in root layout
- [x] Conditional tab bar (voter vs admin)
- [x] Password strength meter
- [x] Form validation & error handling
- [x] Clean, modern UI with smooth animations
- [x] TypeScript support
- [x] Expo Router file-based routing

---

## 🐛 Troubleshooting

### ❌ Backend won't start
```
Error: Port 8000 already in use
```
**Solutions:**
1. Find and kill the process using port 8000:
   ```bash
   # On Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   
   # On macOS/Linux
   lsof -i :8000
   kill -9 <PID>
   ```
2. Or use a different port:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8001
   ```

### ❌ Cannot connect to backend from mobile device
```
Error: Request timed out / Connection refused
```
**Solutions:**
1. **Verify backend is running:**
   - Check that Terminal 1 shows "Server running on [http://0.0.0.0:8000]"
   
2. **Verify correct IP in `services/api.ts`:**
   - Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update `API_BASE_URL` with your actual IP
   - ❌ Don't use `localhost` or `127.0.0.1` for physical device
   - ✅ Use your local network IP: `192.168.x.x` or `10.0.x.x`

3. **Check firewall:**
   - Windows: Allow PHP/Laravel through firewall
   - macOS: System Preferences → Security & Privacy → Firewall
   - Linux: `sudo ufw allow 8000`

4. **Verify network connectivity:**
   - Phone and computer on same WiFi network
   - Try pinging computer from phone (if available)

### ❌ "No spaces in path" error on Windows
```
Error: Error running app. Ensure you have copied .watchmanconfig
```
**Solution:** 
Move your project to a path WITHOUT SPACES:
```bash
# ❌ Wrong: C:\Users\John Doe\My Documents\campusvote-mobile
# ✅ Right: C:\Users\JohnDoe\Desktop\campusvote-mobile
# ✅ Right: C:\Dev\campusvote-mobile
```

### ❌ npm dependencies won't install
```
Error: npm ERR! code ERESOLVE
```
**Solutions:**
```bash
# Clear all caches
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstall with legacy peer deps flag
npm install --legacy-peer-deps

# Or use npm 8+
npm install
```

### ❌ Port 19000 already in use (Expo)
```
Error: Port 19000 already in use
```
**Solutions:**
1. Kill the existing Expo process:
   ```bash
   npx expo start --clear
   ```

2. Use Expo Tunnel (no port needed):
   ```bash
   npx expo start --tunnel
   ```

3. Use a different port:
   ```bash
   npx expo start -p 19001
   ```

### ❌ App crashes after registration/login
```
Error: App closes immediately after login
```
**Solutions:**
1. **Clear Expo cache:**
   ```bash
   npx expo start --clear
   ```

2. **Clear app data on device:**
   - Android: Settings → Apps → [App Name] → Storage → Clear Data
   - iOS: Delete and reinstall Expo Go

3. **Check auth token storage:**
   - Ensure AsyncStorage is working
   - Try logging in again after clearing cache

### ❌ API returns 401 Unauthorized
```
Error: {"message": "Unauthenticated"}
```
**Solutions:**
1. **Token might be expired:**
   - Logout: Press profile icon → Logout
   - Login again

2. **Token not being sent:**
   - Check `services/api.ts` headers include `Authorization: Bearer {token}`
   - Verify token is saved in AsyncStorage

3. **Backend auth issue:**
   - Restart backend: `php artisan serve --host=0.0.0.0 --port=8000`
   - Check Laravel Sanctum is configured in `config/sanctum.php`

### ❌ Database connection error
```
Error: SQLSTATE[HY000] [2002] Connection refused
```
**Solutions:**
1. **Ensure MySQL is running:**
   - XAMPP: Start MySQL from control panel
   - Docker: `docker-compose up`

2. **Check `.env` database config:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=campusvote
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. **Create database if it doesn't exist:**
   ```bash
   # Via phpMyAdmin or MySQL client
   mysql -u root
   CREATE DATABASE campusvote;
   ```

4. **Run migrations:**
   ```bash
   php artisan migrate
   ```

### ❌ White screen / app doesn't load
```
Blank screen after scanning QR code
```
**Solutions:**
1. **Check terminal for errors:**
   - Look at the Expo terminal for red error messages
   - Look at Laravel backend terminal for API errors

2. **Rebuild app:**
   ```bash
   npx expo start --clear
   ```

3. **Restart everything:**
   - Stop both terminal windows (Ctrl+C)
   - Stop and restart backend
   - Start Expo again
   - Scan QR code again

4. **Check network connection:**
   - Verify phone is on same WiFi as computer
   - Try restarting WiFi on phone

### ❌ Migrations fail
```
Error: SQLSTATE[42S01]: Table 'x' already exists
```
**Solutions:**
1. **Fresh database:**
   ```bash
   php artisan migrate:fresh    # Drops and re-creates tables
   php artisan db:seed          # Add sample data
   ```

2. **Rollback last migration:**
   ```bash
   php artisan migrate:rollback
   php artisan migrate
   ```

3. **Reset completely:**
   ```bash
   php artisan migrate:reset
   php artisan migrate
   ```

### ❌ CORS errors
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
Check `config/cors.php` in backend is configured correctly:
```php
'allowed_origins' => ['*'],  // or specific domain
'supports_credentials' => true,
```

### ✅ Still having issues?
1. **Check logs:**
   - Backend: `storage/logs/laravel.log`
   - Mobile: Check Expo terminal output

2. **Try the following in order:**
   ```bash
   # Backend
   php artisan cache:clear
   php artisan config:clear
   php artisan migrate:fresh
   
   # Mobile  
   npx expo start --clear
   ```

3. **Ask for help:**
   - Check project GitHub Issues
   - Provide error message + terminal output

### App crashes after registration
- **Solution**: Clear Expo cache: `expo start --clear` or restart the development server

### "No spaces in path" error on Windows
- **Solution**: Move your project to a folder without spaces (e.g., `C:\Users\USERNAME\Desktop\CampusVote`)

### Dependencies won't install
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 19000 already in use
```bash
# Kill the process or use a different port
npx expo start --tunnel  # Uses Expo's tunnel instead of local network
```

---

## 📚 Useful Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |

---

## 📄 License

This project is part of SNSU's online voting system initiative.

---

## 👥 Support & Contributions

For issues, feature requests, or contributions, please open an issue or pull request on GitHub.

---

## 📞 Contact

For questions or support, contact the CampusVote development team.
- [x] Voter turnout progress bar
- [x] Profile screens with logout

## 🔮 Next Steps
- [ ] Voting ballot UI with candidate selection
- [ ] Real-time Firebase backend
- [ ] Google Sign-In (expo-auth-session)
- [ ] Push notifications (expo-notifications)
- [ ] Election creation form
- [ ] Candidate management
