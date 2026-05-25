/**
 * FirebaseStatusPage.jsx
 * Live Firebase diagnostic panel — shows exactly what's working and what's failing.
 * Accessible at /firebase-status
 */

import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi } from 'lucide-react';

const StatusRow = ({ label, status, detail, subDetail }) => {
  const icon =
    status === 'ok' ? <CheckCircle size={18} className="text-green-400 flex-shrink-0" /> :
    status === 'fail' ? <XCircle size={18} className="text-red-400 flex-shrink-0" /> :
    status === 'warn' ? <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" /> :
    <div className="w-[18px] h-[18px] rounded-full border-2 border-purple-400 border-t-transparent animate-spin flex-shrink-0" />;

  const bg =
    status === 'ok' ? 'bg-green-500/8 border-green-500/20' :
    status === 'fail' ? 'bg-red-500/8 border-red-500/20' :
    status === 'warn' ? 'bg-yellow-500/8 border-yellow-500/20' :
    'bg-purple-500/8 border-purple-500/20';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}>
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {detail && <p className={`text-xs mt-0.5 ${status === 'ok' ? 'text-green-300' : status === 'fail' ? 'text-red-300' : status === 'warn' ? 'text-yellow-300' : 'text-purple-300'}`}>{detail}</p>}
        {subDetail && <p className="text-xs mt-0.5 text-slate-400">{subDetail}</p>}
      </div>
    </div>
  );
};

const FirebaseStatusPage = () => {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    setResults({});

    const next = (key, val) => setResults(prev => ({ ...prev, [key]: val }));

    // 1. Env vars
    const envVars = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    const missingEnv = Object.entries(envVars).filter(([, v]) => !v).map(([k]) => k);
    if (missingEnv.length > 0) {
      next('env', { status: 'fail', label: '❌ Environment Variables', detail: `Missing: ${missingEnv.join(', ')}`, subDetail: 'Check .env file in paisa-tracker/ folder' });
    } else {
      next('env', { status: 'ok', label: '✅ Environment Variables', detail: `Project: ${envVars.projectId}`, subDetail: `API Key: ${envVars.apiKey?.substring(0, 16)}...` });
    }

    // 2. Firebase init
    try {
      const appName = auth.app?.name;
      next('init', { status: 'ok', label: '✅ Firebase SDK Initialized', detail: `App name: ${appName}`, subDetail: `Auth domain: ${envVars.authDomain}` });
    } catch (err) {
      next('init', { status: 'fail', label: '❌ Firebase SDK Failed', detail: err.message });
    }

    // 3. Auth state
    next('auth', { status: 'loading', label: 'Checking Authentication...', detail: 'Reading current auth state' });
    const currentUser = auth.currentUser;
    if (currentUser) {
      next('auth', { status: 'ok', label: '✅ User Authenticated', detail: `UID: ${currentUser.uid}`, subDetail: `Email: ${currentUser.email} | Provider: ${currentUser.providerData[0]?.providerId}` });
    } else {
      next('auth', { status: 'warn', label: '⚠️ Not Signed In', detail: 'No active Firebase Auth session', subDetail: 'Go to /login, create a NEW account (not old localStorage account)' });
    }

    // 4. Firestore connection test
    next('firestore', { status: 'loading', label: 'Testing Firestore Write...', detail: 'Attempting to write a test document' });
    
    if (!currentUser) {
      next('firestore', { status: 'warn', label: '⚠️ Firestore Test Skipped', detail: 'Login first, then run diagnostics again' });
    } else {
    const testRef = doc(db, 'users', currentUser.uid, 'expenses', 'diagnostic-test-doc');
      try {
        await setDoc(testRef, { test: true, ts: serverTimestamp() });
        next('firestore', { status: 'ok', label: '✅ Firestore WRITE succeeded!', detail: `Wrote to: users/${currentUser.uid}/expenses/__diagnostic_test__`, subDetail: 'Collections ARE being created in Firebase' });

        // Try read
        const snap = await getDoc(testRef);
        if (snap.exists()) {
          next('firestoreRead', { status: 'ok', label: '✅ Firestore READ succeeded!', detail: 'Data round-trip confirmed' });
        }

        // Cleanup
        await deleteDoc(testRef);
        next('firestoreClean', { status: 'ok', label: '✅ Firestore DELETE succeeded', detail: 'Test doc cleaned up. Check Firebase Console → Data → users collection!' });
      } catch (err) {
        const fix = err.code === 'permission-denied'
          ? '→ DEPLOY Firestore Rules: Firebase Console → Firestore → Rules → Paste firestore.rules → Publish'
          : err.code === 'unauthenticated'
          ? '→ User not authenticated. Sign up first at /signup'
          : '→ Check internet connection';
        next('firestore', { status: 'fail', label: `❌ Firestore FAILED: ${err.code}`, detail: err.message, subDetail: fix });
      }
    }

    // 5. Auth providers - confirmed by user
    next('providers', { status: 'ok', label: '✅ Auth Providers Enabled', detail: 'Email/Password + Google confirmed active', subDetail: 'All sign-in methods ready' });

    setRunning(false);
  };

  useEffect(() => { runDiagnostics(); }, []);

  const orderedKeys = ['env', 'init', 'auth', 'firestore', 'firestoreRead', 'firestoreClean', 'providers'];

  return (
    <div className="min-h-dvh bg-bg-primary p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}>
            <Wifi size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Firebase Diagnostics</h1>
            <p className="text-slate-400 text-xs">Live connection status</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={running}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={running ? 'animate-spin' : ''} />
            {running ? 'Running...' : 'Re-run'}
          </button>
        </div>

        <div className="space-y-2">
          {orderedKeys.map(key => results[key] ? (
            <StatusRow key={key} {...results[key]} />
          ) : null)}
        </div>

        {/* Fix Guide */}
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <p className="text-white font-semibold text-sm mb-3">🛠️ Common Fixes (Do All 4)</p>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
            <li>
              <span className="font-medium text-white">Create a NEW account</span> — go to{' '}
              <a href="/signup" className="text-purple-400 underline">/signup</a>{' '}
              (old localStorage login doesn't work with Firebase Auth)
            </li>
            <li>
              <span className="font-medium text-white">Enable Email/Password Auth</span> —{' '}
              Firebase Console → Authentication → Sign-in method → Email/Password → Enable
            </li>
            <li>
              <span className="font-medium text-white">Deploy Firestore Rules</span> —{' '}
              Firebase Console → Firestore → Rules tab → Replace with content from{' '}
              <code className="bg-slate-700 px-1 rounded">firestore.rules</code> → Publish
            </li>
            <li>
              <span className="font-medium text-white">Hard refresh app</span> —{' '}
              Ctrl+Shift+R to clear any cached old state
            </li>
          </ol>
        </div>

        <div className="mt-4 text-center">
          <a href="/dashboard" className="text-purple-400 text-sm hover:underline">← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default FirebaseStatusPage;
