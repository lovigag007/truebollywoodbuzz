import { useState, useEffect } from 'react';
import { LayoutGrid, List, Star } from 'lucide-react';
import TrendingSlider from '../components/movies/TrendingSlider';
import { MovieCardGrid, MovieCardList } from '../components/movies/MovieCard';
import AdSlot from '../components/common/AdSlot';
import api from '../utils/api';

const CATEGORIES = ['All', 'Biographical', 'Crime', 'Sports', 'War', 'Historical', 'Political', 'Social'];
const SORTS = [
  { label: 'Latest', value: 'createdAt', order: 'DESC' },
  { label: 'Top Rated', value: 'avgStarRating', order: 'DESC' },
  { label: 'Most Viewed', value: 'viewCount', order: 'DESC' },
  { label: 'Most Real', value: 'avgRealPercent', order: 'DESC' },
  { label: 'Year', value: 'year', order: 'DESC' },
];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState(SORTS[0]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchMovies = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        limit: 12,
        sort: sort.value,
        order: sort.order,
        ...(category !== 'All' && { category: category.toLowerCase() }),
      };
      const res = await api.get('/movies', { params });
      if (reset) {
        setMovies(res.data.data);
        setPage(1);
      } else {
        setMovies((prev) => [...prev, ...res.data.data]);
      }
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(true);
  }, [category, sort]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);
    try {
      const res = await api.get('/movies', {
        params: {
          page: nextPage,
          limit: 12,
          sort: sort.value,
          order: sort.order,
          ...(category !== 'All' && { category: category.toLowerCase() }),
        },
      });
      setMovies((prev) => [...prev, ...res.data.data]);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Banner Ad */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <AdSlot slot="banner" className="mb-4 flex justify-center" />
      </div>

      {/* Trending Slider */}
      <section className="max-w-7xl mx-auto px-4 mb-10">
        <TrendingSlider />
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Movies area */}
          <div className="flex-1 min-w-0">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="section-title">All Movies</h2>
                {pagination && (
                  <p className="text-gray-500 text-sm mt-0.5">{pagination.total} movies found</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sort.value}
                  onChange={(e) => setSort(SORTS.find((s) => s.value === e.target.value) || SORTS[0])}
                  className="bg-cinema-card border border-cinema-border text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="flex bg-cinema-card border border-cinema-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2.5 transition-colors ${view === 'list' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'bg-cinema-card border border-cinema-border text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Inline ad above grid */}
            <AdSlot slot="inline" className="mb-6" />

            {/* Movies Grid / List */}
            {loading && movies.length === 0 ? (
              <div className={view === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-3'
              }>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-cinema-card rounded-2xl animate-pulse ${view === 'grid' ? 'aspect-[2/3]' : 'h-28'}`}
                  />
                ))}
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🎬</p>
                <p className="text-gray-400">No movies found in this category</p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((m, i) => (
                  <div key={m.id}>
                    <MovieCardGrid movie={m} />
                    {(i + 1) % 8 === 0 && i < movies.length - 1 && (
                      <div className="col-span-full mt-2">
                        <AdSlot slot="inline" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {movies.map((m, i) => (
                  <div key={m.id}>
                    <MovieCardList movie={m} />
                    {(i + 1) % 6 === 0 && i < movies.length - 1 && (
                      <AdSlot slot="inline" className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {pagination && page < pagination.totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-ghost px-8"
                >
                  {loading ? 'Loading...' : 'Load More Movies'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 space-y-6 shrink-0">
            <AdSlot slot="rectangle" />

            {/* Top Rated */}
            <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <h3 className="font-display font-bold text-white">Top Rated</h3>
              </div>
              <TopRatedList />
            </div>

            <AdSlot slot="rectangle" />
          </div>
        </div>
      </section>
    </div>
  );
}

function TopRatedList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    api.get('/movies', { params: { sort: 'avgStarRating', order: 'DESC', limit: 5 } })
      .then((res) => {
        setMovies(res.data.data.filter((m) => m.avgStarRating));
      })
      .catch(() => {});
  }, []);

  if (movies.length === 0) {
    return <p className="text-gray-600 text-sm text-center py-4">No rated movies yet</p>;
  }

  return (
    <div className="space-y-3">
      {movies.map((m, i) => (
        <a key={m.id} href={`/movie/${m.slug}`} className="flex items-center gap-3 group">
          <span className="text-2xl font-display font-bold text-cinema-muted group-hover:text-brand-500 transition-colors w-6 text-center">
            {i + 1}
          </span>
          <img
            src={m.posterUrl || `https://placehold.co/40x60/12121a/f97316?text=B`}
            alt={m.title}
            className="w-10 h-14 object-cover rounded-lg"
            onError={(e) => { e.target.src = `https://placehold.co/40x60/12121a/f97316?text=B`; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium line-clamp-1 group-hover:text-brand-400 transition-colors">
              {m.title}
            </p>
            <div className="flex items-center gap-1">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-400">{m.avgStarRating}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
