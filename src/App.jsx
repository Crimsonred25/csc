import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import PendingAccountGuard from '@/components/PendingAccountGuard';

// Public pages
import Landing from '@/pages/Landing';

// Reviewee pages
import Dashboard from '@/pages/Dashboard';
import ReviewGuides from '@/pages/ReviewGuides';
import Flashcards from '@/pages/Flashcards';
import Exams from '@/pages/Exams';
import Leaderboard from '@/pages/Leaderboard';
import ActivityHistory from '@/pages/ActivityHistory';
import StudyCoach from '@/pages/StudyCoach';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import ManageGuides from '@/pages/admin/ManageGuides';
import ManageFlashcards from '@/pages/admin/ManagementFlashcards';
import ManageExams from '@/pages/admin/ManageExams';
import AuditLog from '@/pages/admin/AuditLog';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0b3d91] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // For auth_required or any other error, show the landing page
    return (
      <Routes>
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  // Not authenticated → show landing (login page)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  return (
    <PendingAccountGuard>
      <Routes>
        {/* Shared layout with sidebar */}
        <Route element={<AppLayout />}>
          {/* Reviewee routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/guides" element={<ReviewGuides />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/activity" element={<ActivityHistory />} />
          <Route path="/study-coach" element={<StudyCoach />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/guides" element={<ManageGuides />} />
          <Route path="/admin/flashcards" element={<ManageFlashcards />} />
          <Route path="/admin/exams" element={<ManageExams />} />
          <Route path="/admin/audit" element={<AuditLog />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PendingAccountGuard>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App