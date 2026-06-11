import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/admin/AdminLayout';

import Home from './pages/Home';
import MoviesPage from './pages/MoviesPage';
import MovieDetail from './pages/MovieDetail';
import SearchPage from './pages/SearchPage';
import FeedbackPage from './pages/FeedbackPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminMovieForm from './pages/admin/AdminMovieForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFeedbacks from './pages/admin/AdminFeedbacks';

function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<><Navbar /><main><Home /></main><Footer /></>} />
      <Route path="/movies" element={<><Navbar /><main><MoviesPage /></main><Footer /></>} />
      <Route path="/movie/:slug" element={<><Navbar /><main><MovieDetail /></main><Footer /></>} />
      <Route path="/search" element={<><Navbar /><main><SearchPage /></main><Footer /></>} />
      <Route path="/feedback" element={<><Navbar /><main><FeedbackPage /></main><Footer /></>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/movies" element={<ProtectedAdminRoute><AdminMovies /></ProtectedAdminRoute>} />
      <Route path="/admin/movies/new" element={<ProtectedAdminRoute><AdminMovieForm /></ProtectedAdminRoute>} />
      <Route path="/admin/movies/edit/:id" element={<ProtectedAdminRoute><AdminMovieForm /></ProtectedAdminRoute>} />
      <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
      <Route path="/admin/feedbacks" element={<ProtectedAdminRoute><AdminFeedbacks /></ProtectedAdminRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <><Navbar />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-7xl font-display font-bold text-cinema-muted mb-4">404</p>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Page Not Found</h2>
              <p className="text-gray-500 mb-6">The page you're looking for doesn't exist</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        <Footer /></>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#12121a', color: '#fff', border: '1px solid #1e1e2e', borderRadius: '12px' },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
