import { Link } from 'react-router-dom';
import { Star, Eye, Users, Percent } from 'lucide-react';
import clsx from 'clsx';

const CATEGORY_COLORS = {
  biographical: 'bg-purple-500/20 text-purple-300',
  historical: 'bg-amber-500/20 text-amber-300',
  crime: 'bg-red-500/20 text-red-300',
  sports: 'bg-green-500/20 text-green-300',
  political: 'bg-blue-500/20 text-blue-300',
  social: 'bg-pink-500/20 text-pink-300',
  war: 'bg-orange-500/20 text-orange-300',
  disaster: 'bg-gray-500/20 text-gray-300',
};

export function MovieCardGrid({ movie }) {
  const realPct = movie.avgRealPercent ?? movie.defaultRealPercent ?? 50;
  const realColor = realPct >= 70 ? 'text-green-400' : realPct >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Link to={`/movie/${movie.slug}`} className="card card-hover group block">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl || `https://placehold.co/300x450/12121a/f97316?text=${encodeURIComponent(movie.title)}`}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {movie.isTrending && (
            <span className="badge bg-brand-500/90 text-white text-[10px]">🔥 Trending</span>
          )}
          {movie.category && (
            <span className={clsx('badge text-[10px]', CATEGORY_COLORS[movie.category] || 'bg-gray-500/20 text-gray-300')}>
              {movie.category.charAt(0).toUpperCase() + movie.category.slice(1)}
            </span>
          )}
        </div>

        {/* Star rating overlay */}
        {movie.avgStarRating && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 rounded-lg px-2 py-1">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white font-semibold">{movie.avgStarRating}</span>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-display font-semibold text-white text-sm leading-snug line-clamp-2 mb-1 group-hover:text-brand-400 transition-colors">
          {movie.title}
        </h3>
        {movie.hindiTitle && (
          <p className="text-gray-500 text-xs font-hindi mb-2">{movie.hindiTitle}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{movie.year}</span>
          <div className="flex items-center gap-1">
            <Percent size={10} className={realColor} />
            <span className={clsx('text-xs font-semibold', realColor)}>{Math.round(realPct)}% Real</span>
          </div>
        </div>
        {/* Real meter */}
        <div className="mt-2 h-1 bg-cinema-muted rounded-full overflow-hidden">
          <div
            className="h-full real-meter rounded-full transition-all duration-500"
            style={{ width: `${realPct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export function MovieCardList({ movie }) {
  const realPct = movie.avgRealPercent ?? movie.defaultRealPercent ?? 50;
  const realColor = realPct >= 70 ? 'text-green-400' : realPct >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Link to={`/movie/${movie.slug}`} className="card card-hover group flex gap-4 p-4">
      <img
        src={movie.posterUrl || `https://placehold.co/80x120/12121a/f97316?text=BReel`}
        alt={movie.title}
        className="w-16 h-24 object-cover rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-white leading-snug group-hover:text-brand-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
            {movie.hindiTitle && (
              <p className="text-gray-500 text-xs font-hindi">{movie.hindiTitle}</p>
            )}
          </div>
          {movie.isTrending && <span className="badge bg-brand-500/20 text-brand-300 shrink-0">🔥</span>}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>{movie.year}</span>
          {movie.director && <span>Dir. {movie.director}</span>}
          {movie.language && <span>{movie.language}</span>}
        </div>

        {movie.synopsis && (
          <p className="text-gray-400 text-xs line-clamp-2">{movie.synopsis}</p>
        )}

        <div className="flex items-center gap-4 pt-1">
          {movie.avgStarRating && (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-white font-semibold">{movie.avgStarRating}</span>
              <span className="text-xs text-gray-600">({movie.totalRatings})</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Percent size={11} className={realColor} />
            <span className={clsx('text-xs font-semibold', realColor)}>{Math.round(realPct)}% Real</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={11} className="text-gray-600" />
            <span className="text-xs text-gray-500">{movie.viewCount?.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-1 bg-cinema-muted rounded-full overflow-hidden w-48 max-w-full">
          <div className="h-full real-meter rounded-full" style={{ width: `${realPct}%` }} />
        </div>
      </div>
    </Link>
  );
}
