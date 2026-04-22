import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// ─── Portal Pages ─────────────────────────────────────────────
// NGO
import NGODashboard from './portals/ngo/Dashboard';
import PostTask from './portals/ngo/PostTask';
import TaskList from './portals/ngo/TaskList';
import MatchResults from './portals/ngo/MatchResults';

// Volunteer
import VolunteerDashboard from './portals/volunteer/Dashboard';
import ProfileSetup from './portals/volunteer/ProfileSetup';
import BrowseTasks from './portals/volunteer/BrowseTasks';
import MyMatches from './portals/volunteer/MyMatches';
import Rewards from './portals/volunteer/Rewards';

// Admin
import AdminDashboard from './portals/admin/Dashboard';
import ManageNGOs from './portals/admin/ManageNGOs';
import ManageVolunteers from './portals/admin/ManageVolunteers';
import RunMatching from './portals/admin/RunMatching';
import AuditLog from './portals/admin/AuditLog';

// ─── Layout Shells ────────────────────────────────────────────
function NGOLayout() {
  // TODO: Add NGO sidebar navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4">
        <span className="font-bold text-lg">SRA — NGO Portal</span>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

function VolunteerLayout() {
  // TODO: Add Volunteer sidebar navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4">
        <span className="font-bold text-lg">SRA — Volunteer Portal</span>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

function AdminLayout() {
  // TODO: Add Admin sidebar navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4">
        <span className="font-bold text-lg">SRA — Admin Portal</span>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

// ─── Protected Route ──────────────────────────────────────────
function ProtectedRoute({ role, children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && profile?.role !== role) return <Navigate to="/login" replace />;

  return children;
}

// ─── Login Page (placeholder) ─────────────────────────────────
function LoginPage() {
  // TODO: Implement Google Sign-In UI
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Smart Resource Allocation</h1>
        <p className="text-gray-500 mb-6">Sign in to continue</p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* NGO Portal */}
          <Route
            path="/ngo/*"
            element={
              <ProtectedRoute role="ngo">
                <NGOLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NGODashboard />} />
            <Route path="post-task" element={<PostTask />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="matches/:taskId" element={<MatchResults />} />
          </Route>

          {/* Volunteer Portal */}
          <Route
            path="/volunteer/*"
            element={
              <ProtectedRoute role="volunteer">
                <VolunteerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<VolunteerDashboard />} />
            <Route path="profile" element={<ProfileSetup />} />
            <Route path="browse" element={<BrowseTasks />} />
            <Route path="my-matches" element={<MyMatches />} />
            <Route path="rewards" element={<Rewards />} />
          </Route>

          {/* Admin Portal */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="ngos" element={<ManageNGOs />} />
            <Route path="volunteers" element={<ManageVolunteers />} />
            <Route path="matching" element={<RunMatching />} />
            <Route path="audit" element={<AuditLog />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
