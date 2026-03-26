import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import ProfileBuilder from './pages/ProfileBuilder';
import ProfilePreview from './pages/ProfilePreview';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CompareCandidates from './pages/CompareCandidates';
import CandidateProfile from './pages/CandidateProfile';
import Navbar from './components/Navbar';

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/builder'} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/builder'} replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/onboarding'} replace /> : <Signup />} />
      <Route path="/onboarding" element={<RequireAuth role="candidate"><Onboarding /></RequireAuth>} />
      <Route path="/builder" element={<RequireAuth role="candidate"><Navbar /><ProfileBuilder /></RequireAuth>} />
      <Route path="/preview" element={<RequireAuth role="candidate"><Navbar /><ProfilePreview /></RequireAuth>} />
      <Route path="/recruiter" element={<RequireAuth role="recruiter"><Navbar /><RecruiterDashboard /></RequireAuth>} />
      <Route path="/recruiter/compare" element={<RequireAuth role="recruiter"><Navbar /><CompareCandidates /></RequireAuth>} />
      <Route path="/recruiter/candidate/:id" element={<RequireAuth role="recruiter"><Navbar /><CandidateProfile /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}
