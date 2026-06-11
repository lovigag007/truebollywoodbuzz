import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { MovieCardGrid, MovieCardList } from '../components/movies/MovieCard';
import AdSlot from '../components/common/AdSlot';
import api from '../utils/api';

const CATEGORIES = ['All', 'Biographical', 'Crime', 'Sports', 'War', 'Historical', 'Political', 'Social', 'Disaster', 'Other'];
const YEARS = ['All', ...Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))];
const SORTS = [
  { label: 'Latest Added', value: 'createdAt', order: 'DESC' },
  { label: 'Top Rated', value: 'avgStarRating', order: 'DESC' },
  { label: 'Most Viewed', value: 'viewCount', order: 'DESC' },
  { label: 'Most Real', value: 'avgRealPercent', order: 'DESC' },
  { label: 'Newest Movie', value: 'year', order: 'DESC' },
  { label: 'Oldest Movie', value: 'year', order: 'ASC' },
];

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || 'All';
  const year = searchParams.get('year') || 'All';
  const sortKey = searchParams.get('sort') || 'createdAt';
  const sortOrder = searchParams.get('order') || 'DESC';
  const page = parseInt(searchParams.get('page') || '1');

  const currentSort = SORTS.find((s) => s.value === sortKey && s.order === sortOrder) || SORTS[0];

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'All') params.delete(key);
    else params.set(key, value);
    params.set('page', '1');
    setSearchParams(params);
  };

  useEffect(() => {
    setLoading(true);
    const params = {
      page,
      limit: 16,
      sort: sortKey,
      order: sortOrder,
      ...(category !== 'All' && { category: category.toLowerCase() }),
      ...(year !== 'All' && { year }),
    };
    api.get('/movies', { params })
      .then((res) => { setMovies(res.data.data); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const changePage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">All Movies</h1>
        <p className="text-gray-500 text-sm">Bollywood films based on real events & true stories</p>
      </div>

      {/* Ad */}
      <AdSlot slot="banner" className="mb-6 flex justify-center" />

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-1.5 hidden md:flex">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam('category', cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-brand-500 text-white'
                    : 'bg-cinema-card border border-cinema-border text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-1.5 bg-cinema-card border border-cinema-border text-gray-300 px-3 py-1.5 rounded-xl text-sm"
          >
            <SlidersHorizontal size={14} />
            Filters
            {(category !== 'All' || year !== 'All') && (
              <span className="w-2 h-2 bg-brand-500 rounded-full" />
            )}
          </button>

          {/* Active filter chips */}
          {category !== 'All' && (
            <button onClick={() => updateParam('category', 'All')} className="flex items-center gap-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2.5 py-1 rounded-full text-xs">
              {category} <X size={11} />
            </button>
          )}
          {year !== 'All' && (
            <button onClick={() => updateParam('year', 'All')} className="flex items-center gap-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2.5 py-1 rounded-full text-xs">
              {year} <X size={11} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={`${sortKey}|${sortOrder}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split('|');
              const params = new URLSearchParams(searchParams);
              params.set('sort', s); params.set('order', o); params.set('page', '1');
              setSearchParams(params);
            }}
            className="bg-cinema-card border border-cinema-border text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            {SORTS.map((s) => <option key={`${s.value}|${s.order}`} value={`${s.value}|${s.order}`}>{s.label}</option>)}
          </select>

          <div className="flex bg-cinema-card border border-cinema-border rounded-xl overflow-hidden">
            <button onClick={() => setView('grid')} className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-white'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView('list')} className={`p-2.5 transition-colors ${view === 'list' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-white'}`}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="md:hidden bg-cinema-card border border-cinema-border rounded-2xl p-4 mb-5 space-y-4 animate-fade-in">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => updateParam('category', cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-brand-500 text-white' : 'bg-cinema-muted text-gray-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">Year</p>
            <select value={year} onChange={(e) => updateParam('year', e.target.value)}
              className="bg-cinema-muted border border-cinema-border text-gray-300 text-sm rounded-xl px-3 py-2 w-full focus:outline-none">
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Desktop Year Filter */}
      <div className="hidden md:flex items-center gap-2 mb-6">
        <span className="text-gray-500 text-sm">Year:</span>
        <select value={year} onChange={(e) => updateParam('year', e.target.value)}
          className="bg-cinema-card border border-cinema-border text-gray-300 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500">
          {YEARS.map((y) => <option key={y}>{y}</option>)}
        </select>
        {pagination && <span className="text-gray-600 text-sm ml-2">{pagination.total} movies</span>}
      </div>

      {/* Results */}
      {loading ? (
        <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'space-y-3'}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`bg-cinema-card rounded-2xl animate-pulse ${view === 'grid' ? 'aspect-[2/3]' : 'h-28'}`} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🎬</p>
          <h3 className="text-xl font-display font-bold text-white mb-2">No Movies Found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters</p>
          <button onClick={() => setSearchParams({})} className="btn-ghost">Clear Filters</button>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {movies.map((m, i) => (
                <div key={m.id}>
                  <MovieCardGrid movie={m} />
                  {(i + 1) % 8 === 0 && i < movies.length - 1 && (
                    <div className="col-span-full mt-2"><AdSlot slot="inline" /></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {movies.map((m, i) => (
                <div key={m.id}>
                  <MovieCardList movie={m} />
                  {(i + 1) % 5 === 0 && <AdSlot slot="inline" className="mt-2" />}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="btn-ghost px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => changePage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-cinema-muted'}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => changePage(page + 1)} disabled={page >= pagination.totalPages} className="btn-ghost px-4 py-2 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
