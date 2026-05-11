# CampusVote — SNSU Online Voting System

A mobile voting system built with **React Native + Expo Router** (file-based routing).

---

## � Prerequisites

Before cloning and running the project, ensure you have:

- **Node.js** (v18+ recommended) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Expo Go App** (for testing on mobile) - Available on [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🔄 Clone the Repository

### 1. Clone using Git
```bash
git clone https://github.com/your-username/CampusVote.git
cd CampusVote
```

Or download as ZIP from GitHub and extract it.

### 2. Using SSH (if you have SSH keys configured)
```bash
git clone git@github.com:your-username/CampusVote.git
cd CampusVote
```

### 3. Using GitHub CLI
```bash
gh repo clone your-username/CampusVote
cd CampusVote
```

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
