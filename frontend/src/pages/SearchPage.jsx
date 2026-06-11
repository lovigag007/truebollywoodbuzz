import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MovieCardGrid, MovieCardList } from '../components/movies/MovieCard';
import api from '../utils/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(q);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get('/movies', { params: { search: q, limit: 16 } })
      .then((res) => { setMovies(res.data.data); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  }, [q]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="section-title text-center mb-6">Search Movies</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-cinema-card border border-cinema-border focus-within:border-brand-500 rounded-xl px-4 py-3 transition-all">
            <Search size={18} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, director, actor..."
              className="bg-transparent text-white flex-1 outline-none placeholder-gray-500 text-sm"
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
        </form>
      </div>

      {q && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            {loading ? 'Searching...' : `${pagination?.total || 0} results for `}
            {!loading && <span className="text-white font-semibold">"{q}"</span>}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-cinema-card rounded-2xl animate-pulse" />)}
        </div>
      ) : !q ? (
        <div className="text-center py-20 text-gray-500">Type something to search</div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-display font-bold text-white mb-2">No Results Found</h3>
          <p className="text-gray-500 mb-6">Try a different keyword</p>
          <Link to="/movies" className="btn-ghost">Browse All Movies</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {movies.map((m) => <MovieCardGrid key={m.id} movie={m} />)}
        </div>
      )}
    </div>
  );
}
