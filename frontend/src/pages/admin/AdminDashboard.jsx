import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Users, Star, MessageSquare, TrendingUp, Eye, Plus, BarChart3, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    api.get('/admin/stats').then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading dashboard...</div></div>;

  const { stats: s, topRatedMovies, mostViewedMovies, recentRatings } = stats || {};

  const statCards = [
    { label: 'Total Movies', value: s?.totalMovies, sub: `${s?.publishedMovies} published`, icon: Film, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Users', value: s?.totalUsers, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Ratings', value: s?.totalRatings, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Pending Feedback', value: s?.pendingFeedbacks, sub: `${s?.totalFeedbacks} total`, icon: MessageSquare, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Trending Movies', value: s?.trendingMovies, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <Link to="/admin/movies/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Movie
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((sc) => (
          <div key={sc.label} className="bg-cinema-card border border-cinema-border rounded-2xl p-5">
            <div className={`w-10 h-10 ${sc.bg} rounded-xl flex items-center justify-center mb-3`}>
              <sc.icon size={20} className={sc.color} />
            </div>
            <p className="text-2xl font-display font-bold text-white">{sc.value ?? '-'}</p>
            <p className="text-gray-500 text-sm mt-0.5">{sc.label}</p>
            {sc.sub && <p className="text-xs text-gray-600 mt-0.5">{sc.sub}</p>}
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Manage Movies', path: '/admin/movies', icon: Film },
          { label: 'Manage Users', path: '/admin/users', icon: Users },
          { label: 'Feedbacks', path: '/admin/feedbacks', icon: MessageSquare },
          { label: 'Add New Movie', path: '/admin/movies/new', icon: Plus },
        ].map((link) => (
          <Link key={link.path} to={link.path}
            className="bg-cinema-card border border-cinema-border hover:border-brand-500/40 rounded-xl p-4 flex items-center gap-3 transition-all group">
            <link.icon size={18} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
            <span className="text-gray-300 group-hover:text-white text-sm font-medium transition-colors">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Ratings */}
        <div className="lg:col-span-2 bg-cinema-card border border-cinema-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} className="text-brand-400" />
            <h3 className="font-display font-bold text-white">Recent Ratings</h3>
          </div>
          <div className="space-y-3">
            {recentRatings?.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-cinema-border/50 last:border-0">
                <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-brand-400 text-xs font-bold">{(r.user?.name || '?')[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{r.user?.name || r.user?.phone}</p>
                  <p className="text-xs text-gray-500 truncate">rated <span className="text-gray-400">{r.movie?.title}</span></p>
                </div>
                <div className="text-right shrink-0">
                  {r.starRating && <div className="flex items-center gap-0.5 justify-end"><Star size={11} className="text-yellow-400 fill-yellow-400" /><span className="text-xs text-white">{r.starRating}</span></div>}
                  {r.realPercent !== null && <p className="text-xs text-brand-400">{r.realPercent}% real</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated */}
        <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-yellow-400" />
            <h3 className="font-display font-bold text-white">Top Rated</h3>
          </div>
          <div className="space-y-3">
            {topRatedMovies?.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-xl font-display font-bold text-cinema-muted w-5">{i + 1}</span>
                <img src={m.posterUrl || `https://placehold.co/32x48/12121a/f97316`} alt={m.title} className="w-8 h-11 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <Link to={`/movie/${m.slug}`} className="text-sm text-white hover:text-brand-400 transition-colors font-medium line-clamp-1">{m.title}</Link>
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-400">{m.avgStarRating} ({m.totalRatings})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-cinema-border">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-1.5"><Eye size={13} /> Most Viewed</h4>
            <div className="space-y-2">
              {mostViewedMovies?.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2">
                  <Link to={`/movie/${m.slug}`} className="text-sm text-gray-300 hover:text-brand-400 transition-colors line-clamp-1">{m.title}</Link>
                  <span className="text-xs text-gray-500 shrink-0">{m.viewCount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
