import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, Users, Eye, Percent, Play } from 'lucide-react';
import RatingWidget from '../components/movies/RatingWidget';
import ShareButtons from '../components/movies/ShareButtons';
import AdSlot from '../components/common/AdSlot';
import LoginModal from '../components/auth/LoginModal';
import api from '../utils/api';
import clsx from 'clsx';

const STREAMING_COLORS = {
  'Netflix': 'bg-red-600/20 text-red-400 border-red-600/30',
  'Prime Video': 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  'Hotstar': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'SonyLIV': 'bg-orange-600/20 text-orange-400 border-orange-600/30',
  'Zee5': 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  'Jio Cinema': 'bg-blue-400/20 text-blue-300 border-blue-400/30',
};

export default function MovieDetail() {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [recentRatings, setRecentRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('story');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    setMovie(null);

    api.get(`/movies/${slug}`)
      .then((res) => {
        if (res.data && res.data.data) {
          setMovie(res.data.data);
          setRecentRatings(res.data.recentRatings || []);
          setUserRating(res.data.userRating || null);
        } else {
          setError('Movie data not found');
        }
      })
      .catch((err) => {
        console.error('MovieDetail fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load movie');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRated = (updatedMovie) => {
    setMovie((prev) => ({ ...prev, ...updatedMovie }));
  };

  if (loading) return <MovieDetailSkeleton />;

  if (error || !movie) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-6xl mb-4">🎬</p>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          {error || 'Movie Not Found'}
        </h2>
        <p className="text-gray-500 mb-6 text-sm">The movie you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );

  const realPct = movie.avgRealPercent ?? movie.defaultRealPercent ?? 50;
  const realColor = realPct >= 70 ? '#22c55e' : realPct >= 40 ? '#eab308' : '#ef4444';
  const hasVotes = (movie.totalPercentVotes || 0) > 0;
  const posterFallback = `https://placehold.co/300x450/12121a/f97316?text=${encodeURIComponent(movie.title || 'Movie')}`;
  const bannerFallback = `https://placehold.co/1400x400/0a0a0f/f97316?text=${encodeURIComponent(movie.title || 'Movie')}`;

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Banner */}
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img
            src={movie.bannerUrl || movie.posterUrl || bannerFallback}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
            onError={(e) => { e.target.src = bannerFallback; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT - Main Content */}
            <div className="flex-1 min-w-0">
              {/* Movie Header */}
              <div className="flex gap-5 mb-8">
                <img
                  src={movie.posterUrl || posterFallback}
                  alt={movie.title}
                  className="w-28 md:w-40 rounded-2xl shadow-2xl border border-white/10 shrink-0 self-start"
                  onError={(e) => { e.target.src = posterFallback; }}
                />
                <div className="space-y-3 pt-2 min-w-0">
                  <div>
                    <h1 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight">{movie.title}</h1>
                    {movie.hindiTitle && (
                      <p className="text-gray-400 font-hindi text-lg mt-1">{movie.hindiTitle}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                    {movie.year && <span className="flex items-center gap-1"><Calendar size={13} />{movie.year}</span>}
                    {movie.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} />{Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                      </span>
                    )}
                    {movie.language && <span>{movie.language}</span>}
                    {movie.director && <span>Dir. {movie.director}</span>}
                    {movie.category && (
                      <span className="capitalize bg-cinema-muted px-2 py-0.5 rounded-full text-xs">{movie.category}</span>
                    )}
                  </div>

                  {/* Ratings row */}
                  <div className="flex flex-wrap gap-3">
                    {movie.avgStarRating ? (
                      <div className="flex items-center gap-2 bg-cinema-card border border-cinema-border rounded-xl px-3 py-2">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-white">{movie.avgStarRating}</span>
                        <span className="text-gray-500 text-xs">({movie.totalRatings || 0} ratings)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-cinema-card border border-cinema-border rounded-xl px-3 py-2">
                        <Star size={16} className="text-gray-600" />
                        <span className="text-gray-500 text-sm">No ratings yet</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 bg-cinema-card border border-cinema-border rounded-xl px-3 py-2">
                      <Percent size={16} style={{ color: realColor }} />
                      <span className="font-bold" style={{ color: realColor }}>{Math.round(realPct)}% Real</span>
                      <span className="text-gray-500 text-xs">
                        {hasVotes ? `(${movie.totalPercentVotes} votes)` : '(default)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-cinema-card border border-cinema-border rounded-xl px-3 py-2">
                      <Eye size={16} className="text-gray-500" />
                      <span className="text-gray-400 text-sm">{(movie.viewCount || 0).toLocaleString()} views</span>
                    </div>
                  </div>

                  {/* Real Meter bar */}
                  <div className="max-w-xs">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>0% Fiction</span>
                      <span>100% Real</span>
                    </div>
                    <div className="h-2.5 bg-cinema-muted rounded-full overflow-hidden">
                      <div
                        className="h-full real-meter rounded-full transition-all duration-700"
                        style={{ width: `${realPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Streaming Platforms */}
                  {Array.isArray(movie.streamingOn) && movie.streamingOn.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {movie.streamingOn.map((s) => (
                        <span
                          key={s}
                          className={clsx('badge border text-xs', STREAMING_COLORS[s] || 'bg-cinema-muted text-gray-400 border-cinema-border')}
                        >
                          ▶ {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {movie.trailerUrl && (
                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 btn-primary text-sm"
                    >
                      <Play size={14} className="fill-white" /> Watch Trailer
                    </a>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-cinema-border mb-6 gap-1">
                {['story', 'cast', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      'px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px',
                      activeTab === tab
                        ? 'border-brand-500 text-brand-400'
                        : 'border-transparent text-gray-500 hover:text-white'
                    )}
                  >
                    {tab}
                    {tab === 'reviews' && recentRatings.filter(r => r.review).length > 0 && (
                      <span className="ml-1.5 text-xs bg-cinema-muted text-gray-400 px-1.5 py-0.5 rounded-full">
                        {recentRatings.filter(r => r.review).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Story Tab ── */}
              {activeTab === 'story' && (
                <div className="space-y-6 animate-fade-in">
                  {movie.synopsis && (
                    <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
                      <h3 className="font-display font-bold text-white mb-3 text-lg">Synopsis</h3>
                      <p className="text-gray-300 leading-relaxed">{movie.synopsis}</p>
                    </div>
                  )}

                  {movie.trueEventDescription && (
                    <div className="bg-cinema-card border border-brand-500/20 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 rounded-l-2xl" />
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-brand-400 text-sm font-bold">T</span>
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-white text-lg">The True Story</h3>
                          <p className="text-gray-500 text-xs">What actually happened</p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{movie.trueEventDescription}</p>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {movie.realEventDate && (
                          <div className="bg-cinema-muted rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                              <Calendar size={11} /> When it happened
                            </p>
                            <p className="text-white text-sm font-medium">{movie.realEventDate}</p>
                          </div>
                        )}
                        {movie.realEventLocation && (
                          <div className="bg-cinema-muted rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                              <MapPin size={11} /> Where
                            </p>
                            <p className="text-white text-sm font-medium">{movie.realEventLocation}</p>
                          </div>
                        )}
                        {movie.realPersonNames && (
                          <div className="bg-cinema-muted rounded-xl p-3 col-span-full">
                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                              <Users size={11} /> Real people involved
                            </p>
                            <p className="text-white text-sm font-medium">{movie.realPersonNames}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <AdSlot slot="inline" />
                </div>
              )}

              {/* ── Cast Tab ── */}
              {activeTab === 'cast' && (
                <div className="space-y-4 animate-fade-in">
                  {Array.isArray(movie.cast) && movie.cast.length > 0 ? (
                    <>
                      <h3 className="font-display font-bold text-white text-lg">Cast & Crew</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {movie.cast.map((c, i) => (
                          <div
                            key={i}
                            className="bg-cinema-card border border-cinema-border rounded-xl p-4 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 bg-cinema-muted rounded-full flex items-center justify-center shrink-0">
                              <span className="text-white font-bold">
                                {c.name ? c.name[0].toUpperCase() : '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                              {c.character && (
                                <p className="text-gray-500 text-xs truncate">as {c.character}</p>
                              )}
                              {c.role && (
                                <p className="text-brand-400 text-xs capitalize">{c.role}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {movie.director && (
                        <div className="bg-cinema-card border border-cinema-border rounded-xl p-4">
                          <p className="text-gray-500 text-xs mb-1">Director</p>
                          <p className="text-white font-semibold">{movie.director}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-10">No cast information available</p>
                  )}
                </div>
              )}

              {/* ── Reviews Tab ── */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-display font-bold text-white text-lg">User Reviews</h3>
                  {recentRatings.filter((r) => r.review).length > 0 ? (
                    recentRatings.filter((r) => r.review).map((r) => (
                      <div
                        key={r.id}
                        className="bg-cinema-card border border-cinema-border rounded-xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-brand-500/20 rounded-full flex items-center justify-center">
                              <span className="text-brand-400 text-xs font-bold">
                                {(r.user?.name || '?')[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white text-sm font-medium">
                              {r.user?.name || 'Anonymous'}
                            </span>
                          </div>
                          {r.starRating && (
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-yellow-400 text-sm font-bold">{r.starRating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm">{r.review}</p>
                        {r.realPercent != null && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-cinema-muted rounded-full overflow-hidden">
                              <div className="h-full real-meter" style={{ width: `${r.realPercent}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{r.realPercent}% real</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT Sidebar */}
            <div className="lg:w-72 space-y-5 shrink-0">
              <RatingWidget
                movie={movie}
                userRating={userRating}
                onRated={handleRated}
                onLoginRequired={() => setShowLogin(true)}
              />
              <ShareButtons movie={movie} />
              <AdSlot slot="rectangle" />

              {/* Tags */}
              {Array.isArray(movie.tags) && movie.tags.length > 0 && (
                <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/search?q=${tag}`}
                        className="text-xs bg-cinema-muted hover:bg-cinema-border text-gray-400 hover:text-white px-2.5 py-1 rounded-lg transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Movie Info box */}
              <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400">Movie Info</h4>
                {movie.genre && Array.isArray(movie.genre) && movie.genre.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Genre</p>
                    <div className="flex flex-wrap gap-1">
                      {movie.genre.map((g) => (
                        <span key={g} className="text-xs bg-cinema-muted text-gray-400 px-2 py-0.5 rounded-full">{g}</span>
                      ))}
                    </div>
                  </div>
                )}
                {movie.producer && (
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Producer</p>
                    <p className="text-sm text-gray-300">{movie.producer}</p>
                  </div>
                )}
                {movie.releaseDate && (
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Release Date</p>
                    <p className="text-sm text-gray-300">
                      {new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

function MovieDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-72 md:h-96 bg-cinema-card" />
      <div className="max-w-7xl mx-auto px-4 -mt-32 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6 pt-4">
            <div className="flex gap-5">
              <div className="w-28 md:w-40 aspect-[2/3] bg-cinema-muted rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3 pt-4">
                <div className="h-8 bg-cinema-muted rounded w-3/4" />
                <div className="h-4 bg-cinema-muted rounded w-1/2" />
                <div className="h-4 bg-cinema-muted rounded w-2/3" />
                <div className="flex gap-2">
                  <div className="h-10 w-28 bg-cinema-muted rounded-xl" />
                  <div className="h-10 w-28 bg-cinema-muted rounded-xl" />
                </div>
              </div>
            </div>
            <div className="h-48 bg-cinema-muted rounded-2xl" />
            <div className="h-64 bg-cinema-muted rounded-2xl" />
          </div>
          <div className="lg:w-72 space-y-4">
            <div className="h-80 bg-cinema-muted rounded-2xl" />
            <div className="h-40 bg-cinema-muted rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
