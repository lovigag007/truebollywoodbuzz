import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, TrendingUp, Star, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminMovies() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { if (!isAdmin) navigate('/'); }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/movies', { params: { page, limit: 15, search } });
      setMovies(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMovies(); }, [page, search]);

  const handleDelete = async (movie) => {
    if (!window.confirm(`Delete "${movie.title}"? This cannot be undone.`)) return;
    setDeleting(movie.id);
    try {
      await api.delete(`/admin/movies/${movie.id}`);
      toast.success('Movie deleted');
      fetchMovies();
    } catch { toast.error('Failed to delete'); } finally { setDeleting(null); }
  };

  const togglePublish = async (movie) => {
    try {
      await api.put(`/admin/movies/${movie.id}`, { isPublished: !movie.isPublished });
      toast.success(`Movie ${movie.isPublished ? 'unpublished' : 'published'}`);
      fetchMovies();
    } catch { toast.error('Failed to update'); }
  };

  const toggleTrending = async (movie) => {
    try {
      await api.put(`/admin/movies/${movie.id}`, { isTrending: !movie.isTrending });
      toast.success(`Trending ${movie.isTrending ? 'removed' : 'set'}`);
      fetchMovies();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Manage Movies</h1>
          {pagination && <p className="text-gray-500 text-sm mt-0.5">{pagination.total} movies total</p>}
        </div>
        <Link to="/admin/movies/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add Movie
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-cinema-card border border-cinema-border rounded-xl px-4 py-2.5 mb-6 max-w-md">
        <Search size={16} className="text-gray-500 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search movies..."
          className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-500"
        />
      </div>

      {/* Table */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Movie</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Year</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Category</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Rating</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Views</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-cinema-border/50">
                    <td className="px-4 py-3" colSpan={7}><div className="h-8 bg-cinema-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : movies.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-12">No movies found</td></tr>
              ) : (
                movies.map((movie) => (
                  <tr key={movie.id} className="border-b border-cinema-border/50 hover:bg-cinema-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.posterUrl || `https://placehold.co/40x56/12121a/f97316?text=B`}
                          alt={movie.title}
                          className="w-8 h-11 object-cover rounded-lg shrink-0"
                        />
                        <div>
                          <p className="text-white font-medium line-clamp-1">{movie.title}</p>
                          {movie.isTrending && <span className="text-[10px] text-brand-400">🔥 Trending</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{movie.year}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs bg-cinema-muted text-gray-400 px-2 py-0.5 rounded-full capitalize">{movie.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {movie.avgStarRating ? (
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-xs">{movie.avgStarRating}</span>
                          <span className="text-gray-600 text-xs">({movie.totalRatings})</span>
                        </div>
                      ) : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{movie.viewCount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePublish(movie)} className="flex items-center gap-1.5 text-xs">
                        {movie.isPublished
                          ? <><ToggleRight size={16} className="text-green-400" /><span className="text-green-400 hidden sm:inline">Live</span></>
                          : <><ToggleLeft size={16} className="text-gray-600" /><span className="text-gray-600 hidden sm:inline">Draft</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/movie/${movie.slug}`} target="_blank"
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-cinema-muted rounded-lg transition-all" title="View">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => toggleTrending(movie)}
                          className={`p-1.5 rounded-lg transition-all ${movie.isTrending ? 'text-brand-400 bg-brand-500/10' : 'text-gray-500 hover:text-brand-400 hover:bg-cinema-muted'}`} title="Toggle Trending">
                          <TrendingUp size={14} />
                        </button>
                        <Link to={`/admin/movies/edit/${movie.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-cinema-muted rounded-lg transition-all" title="Edit">
                          <Edit size={14} />
                        </Link>
                        <button onClick={() => handleDelete(movie)} disabled={deleting === movie.id}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-cinema-muted rounded-lg transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-cinema-border">
            <p className="text-gray-500 text-sm">Page {page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
