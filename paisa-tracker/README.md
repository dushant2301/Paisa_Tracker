<div align="center">

# 💸 Expense Tracker

### A modern, full-stack expense tracking web application built with Firebase & deployed on Vercel

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://your-app.vercel.app)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

![App Preview](https://placehold.co/900x500/0f0f1a/7C3AED?text=Expense+Tracker+Preview)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#️-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#-firebase-setup)
  - [Environment Variables](#-environment-variables)
  - [Run Locally](#️-run-locally)
- [Deployment](#-deployment-on-vercel)
- [Future Improvements](#-future-improvements)
- [Challenges Faced](#-challenges-faced)
- [What I Learned](#-what-i-learned)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🧾 About the Project

**Expense Tracker** is a full-stack personal finance web application designed to help users take control of their money. Built using **Firebase** for backend, authentication, and database, and deployed live on **Vercel**, this project simulates a real-world production-grade application.

Users can securely sign up, log in, track their daily income and expenses, categorize transactions, and visualize their financial data through interactive charts — all from any device.

> 🎯 This project was built as a learning project to master **Firebase**, **Firestore**, **Authentication**, **Vercel deployment**, and **full-stack development workflow**.

---

## ✨ Features

- 🔐 **Secure Authentication** — Sign up & log in with Email/Password or Google OAuth
- 💰 **Balance Overview** — See your real-time available balance at a glance
- ➕ **Add Transactions** — Log income and expenses with categories, notes, and dates
- 🗂️ **Category-wise Tracking** — Food, Travel, Shopping, Bills, Entertainment & more
- 📊 **Visual Charts** — Pie charts and bar graphs for spending analysis
- 📅 **Monthly Reports** — Filter and view transactions by month
- 🔍 **Search & Filter** — Search by category, date, or keyword
- 🛍️ **Shop Tracker** — Track expenses made on behalf of others (e.g., family shop)
- 👥 **Friends Money Tracker** — Track who owes you money with pending/received status
- 🌙 **Dark Mode UI** — Premium glassmorphism dark theme throughout
- 📱 **Fully Responsive** — Works perfectly on mobile, tablet, and desktop
- ☁️ **Cloud Sync** — All data stored in Firestore, synced across devices in real-time
- 🚀 **Deployed on Vercel** — Live and publicly accessible

---

## 📸 Screenshots

> Replace the placeholder links below with actual screenshots from your app.

| Dashboard | Expenses | Analytics |
|-----------|----------|-----------|
| ![Dashboard](https://placehold.co/400x250/13131a/7C3AED?text=Dashboard) | ![Expenses](https://placehold.co/400x250/13131a/3B82F6?text=Expenses) | ![Analytics](https://placehold.co/400x250/13131a/10B981?text=Analytics) |

| Login | Shop Tracker | Friends |
|-------|-------------|---------|
| ![Login](https://placehold.co/400x250/13131a/7C3AED?text=Login) | ![Shop](https://placehold.co/400x250/13131a/F59E0B?text=Shop+Tracker) | ![Friends](https://placehold.co/400x250/13131a/EF4444?text=Friends) |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | Structure & Semantics |
| CSS3 | Styling & Animations |
| JavaScript (ES6+) | Application Logic |
| Tailwind CSS | Utility-first Styling |
| Framer Motion | Animations & Transitions |
| Recharts | Data Visualization |

### Backend & Services
| Technology | Purpose |
|---|---|
| Firebase Authentication | User sign-up, login, Google OAuth |
| Firebase Firestore | NoSQL cloud database (real-time) |

### DevOps & Deployment
| Technology | Purpose |
|---|---|
| Vite | Build tool & dev server |
| Vercel | Production hosting & CI/CD |
| Git & GitHub | Version control |

---

## 📁 Folder Structure

```
expense-tracker/
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── layout/           # TopBar, Sidebar, BottomNav, PageWrapper
│   │   └── ui/               # Button, Card, Modal, Badge, Skeleton
│   ├── constants/
│   │   └── categories.js     # Expense category definitions
│   ├── context/
│   │   ├── AuthContext.jsx   # Firebase Auth state management
│   │   └── AppContext.jsx    # Firestore data state management
│   ├── pages/
│   │   ├── Auth/             # Login.jsx, Signup.jsx
│   │   ├── Dashboard/        # Dashboard.jsx
│   │   ├── Expenses/         # Expenses.jsx, AddExpenseModal.jsx
│   │   ├── Shop/             # ShopTracker.jsx
│   │   ├── Friends/          # FriendsTracker.jsx
│   │   └── Analytics/        # Analytics.jsx
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── storage.js
│   ├── firebase.js           # Firebase initialization
│   ├── App.jsx               # Routes & providers
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── .env                      # Environment variables (never commit!)
├── .env.example              # Template for environment variables
├── .gitignore
├── vercel.json               # Vercel SPA routing config
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- A [Firebase account](https://firebase.google.com/) (free)
- A [Vercel account](https://vercel.com/) (free)

Check your versions:
```bash
node --version   # Should be v18+
npm --version    # Should be v9+
git --version
```

---

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

**2. Install dependencies**
```bash
npm install
```

---

### 🔥 Firebase Setup

**Step 1 — Create a Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → Name it `expense-tracker`
3. Disable Google Analytics (optional) → Click **"Create project"**

**Step 2 — Register a Web App**
1. Click the **`</>`** (Web) icon on the project dashboard
2. App nickname: `expense-tracker-web`
3. Click **"Register app"**
4. Copy the `firebaseConfig` object — you'll need it for environment variables

**Step 3 — Enable Authentication**
1. Go to **Authentication → Sign-in method**
2. Enable **Email/Password** → Save
3. Enable **Google** → Select your support email → Save

**Step 4 — Create Firestore Database**
1. Go to **Firestore Database → Create database**
2. Choose **"Start in production mode"**
3. Location: **`asia-south1`** (recommended for India)
4. Click **"Enable"**

**Step 5 — Set Firestore Security Rules**

Go to **Firestore → Rules** tab and replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```
Click **"Publish"**.

---

### 🔐 Environment Variables

**1. Create your `.env` file** in the project root:
```bash
cp .env.example .env
```

**2. Fill in your Firebase credentials:**
```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

Find these values at:
> **Firebase Console → Project Settings ⚙️ → Your apps → SDK setup and configuration**

---

### ▶️ Run Locally

Start the development server:
```bash
npm run dev
```

Open your browser and visit:
```
http://localhost:5173
```

Build for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment on Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/expense-tracker.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **"Add New Project"**
2. Import your GitHub repository
3. Set **Root Directory** if your Vite app is inside a subfolder

### Step 3 — Add Environment Variables
In the Vercel dashboard, add all 7 `VITE_FIREBASE_*` variables under **Environment Variables** before deploying.

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

### Step 4 — Deploy
Click **"Deploy"** → Your app is live at:
```
https://expense-tracker-xxxx.vercel.app
```

### Step 5 — Authorize Your Domain in Firebase
1. Go to **Firebase Console → Authentication → Settings → Authorized domains**
2. Click **"Add domain"**
3. Enter your Vercel URL (without `https://`)
4. Click **Add** ✅

### Auto-Deploy on Future Pushes
```bash
git add .
git commit -m "feat: added new feature"
git push
# Vercel auto-deploys in ~60 seconds ✅
```

---

## 🔮 Future Improvements

- [ ] 📤 Export transactions as PDF / Excel reports
- [ ] 🔔 Push notifications for spending limits
- [ ] 💳 Bank statement import via CSV upload
- [ ] 🎯 Budget goals and spending alerts
- [ ] 🌍 Multi-currency support
- [ ] 👨‍👩‍👧 Multi-user / family accounts
- [ ] 🤖 AI-powered spending insights
- [ ] 📲 PWA — installable as a mobile app
- [ ] 🏦 UPI transaction auto-import

---

## 🧗 Challenges Faced

- **Firebase Auth + Firestore integration** — Connecting Authentication with Firestore user records required understanding how `onAuthStateChanged` works and when to read/write user profiles
- **Real-time data sync** — Using `onSnapshot` listeners correctly without causing memory leaks took several iterations
- **Google Sign-In on deployed sites** — `signInWithPopup` was getting blocked by browsers in production; switching to `signInWithRedirect` solved this
- **Environment variables with Vite** — Variables must be prefixed with `VITE_` to be exposed to the frontend build
- **Vercel SPA routing** — Direct URL access to routes like `/dashboard` returned 404 until `vercel.json` rewrites were added
- **Balance calculation bug** — Debugged a double-deduction issue where balance was being subtracted both in storage and in computed state

---

## 📚 What I Learned

- ✅ How to set up and use **Firebase Authentication** (Email/Password + Google OAuth)
- ✅ How to structure and query a **Firestore NoSQL database**
- ✅ How to write **Firestore Security Rules** to protect user data
- ✅ How to manage **global app state** using React Context API
- ✅ How to use **environment variables** in Vite securely
- ✅ The difference between `signInWithPopup` and `signInWithRedirect`
- ✅ How to deploy a **React SPA to Vercel** with correct routing config
- ✅ How **CI/CD auto-deployment** works via GitHub + Vercel integration
- ✅ Building a **responsive dark-mode UI** with Tailwind CSS and Framer Motion
- ✅ Real-world **full-stack development workflow** from local development to production

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. **Fork** the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a **Pull Request** on GitHub

### Guidelines
- Follow existing code style and naming conventions
- Write clear, descriptive commit messages
- Test your changes before submitting a PR
- Update documentation if needed

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License — Copyright (c) 2024 Your Name
Free to use, modify and distribute with attribution.
```

---

## 📬 Contact

**Your Name**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your-email@gmail.com)

> Feel free to reach out if you have questions, suggestions, or just want to connect! 🙌

---

<div align="center">

Made with ❤️ by **Your Name**

⭐ **Star this repo** if you found it helpful!

</div>
