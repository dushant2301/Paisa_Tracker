import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Expenses from './pages/Expenses/Expenses';
import ShopTracker from './pages/Shop/ShopTracker';
import FriendsTracker from './pages/Friends/FriendsTracker';
import Analytics from './pages/Analytics/Analytics';
import MonthlyReports from './pages/Reports/MonthlyReports';
import FirebaseStatusPage from './pages/Debug/FirebaseStatusPage';

// Protected route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-dvh bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}
          >
            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-text-muted text-sm">Loading Paisa Tracker...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route
      path="/login"
      element={<PublicRoute><Login /></PublicRoute>}
    />
    <Route
      path="/signup"
      element={<PublicRoute><Signup /></PublicRoute>}
    />
    <Route
      path="/dashboard"
      element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
    />
    <Route
      path="/expenses"
      element={<ProtectedRoute><Expenses /></ProtectedRoute>}
    />
    <Route
      path="/shop"
      element={<ProtectedRoute><ShopTracker /></ProtectedRoute>}
    />
    <Route
      path="/friends"
      element={<ProtectedRoute><FriendsTracker /></ProtectedRoute>}
    />
    <Route
      path="/analytics"
      element={<ProtectedRoute><Analytics /></ProtectedRoute>}
    />
    <Route
      path="/reports"
      element={<ProtectedRoute><MonthlyReports /></ProtectedRoute>}
    />
    <Route path="/firebase-status" element={<FirebaseStatusPage />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1C1C27',
                color: '#F8FAFC',
                border: '1px solid #2D2D45',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Poppins, Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#0A0A0F' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#0A0A0F' },
              },
            }}
          />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
