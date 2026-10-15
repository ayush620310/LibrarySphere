import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import { RouteLoadingFallback } from './components/ui/Spinner';

// Lazy loading route-level pages for faster initial load
const PublicPage = lazy(() => import('./pages/public/PublicPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const SignupPage = lazy(() => import('./pages/admin/SignupPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const MembersPage = lazy(() => import('./pages/admin/MembersPage'));
const SeatsPage = lazy(() => import('./pages/admin/SeatsPage'));
const SlotsPage = lazy(() => import('./pages/admin/SlotsPage'));
const FeesPage = lazy(() => import('./pages/admin/FeesPage'));
const NoticesPage = lazy(() => import('./pages/admin/NoticesPage'));
const LibrarySettingsPage = lazy(() => import('./pages/admin/LibrarySettingsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

const AdminRoute = ({ children }) => (
  <ProtectedRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<PublicPage />} />
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/signup" element={<SignupPage />} />
              <Route path="/admin/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
              <Route path="/admin/members" element={<AdminRoute><MembersPage /></AdminRoute>} />
              <Route path="/admin/seats" element={<AdminRoute><SeatsPage /></AdminRoute>} />
              <Route path="/admin/slots" element={<AdminRoute><SlotsPage /></AdminRoute>} />
              <Route path="/admin/fees" element={<AdminRoute><FeesPage /></AdminRoute>} />
              <Route path="/admin/notices" element={<AdminRoute><NoticesPage /></AdminRoute>} />
              <Route path="/admin/library" element={<AdminRoute><LibrarySettingsPage /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/library/:id" element={<PublicPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3200,
              style: {
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: '600',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
