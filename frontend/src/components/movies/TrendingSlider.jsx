import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Star, Percent, Play, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function TrendingSlider() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/movies/trending').then((res) => setMovies(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[480px] md:h-[560px] bg-cinema-card animate-pulse rounded-2xl" />
    );
  }

  if (!movies.length) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Label */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-brand-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
        <TrendingUp size={12} /> TRENDING NOW
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="w-full h-[480px] md:h-[560px]"
      >
        {movies.map((movie) => {
          const realPct = movie.avgRealPercent ?? movie.defaultRealPercent ?? 50;
          return (
            <SwiperSlide key={movie.id}>
              <div className="relative w-full h-full">
                {/* Background banner */}
                <img
                  src={movie.bannerUrl || movie.posterUrl || `https://placehold.co/1400x600/0a0a0f/f97316?text=${encodeURIComponent(movie.title)}`}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-transparent to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-end pb-12 px-6 md:px-12">
                  <div className="flex items-end gap-6 max-w-2xl">
                    {/* Small poster */}
                    <img
                      src={movie.posterUrl || `https://placehold.co/120x180/12121a/f97316?text=B`}
                      alt={movie.title}
                      className="hidden sm:block w-28 h-40 object-cover rounded-xl shadow-2xl border border-white/10 shrink-0"
                    />
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{movie.year} • {movie.language}</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">{movie.title}</h2>
                        {movie.hindiTitle && <p className="text-gray-300 font-hindi text-lg">{movie.hindiTitle}</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {movie.avgStarRating && (
                          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-white font-bold">{movie.avgStarRating}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
                          <Percent size={13} className="text-brand-400" />
                          <span className="text-sm text-white font-bold">{Math.round(realPct)}% Real</span>
                        </div>
                        {movie.category && (
                          <span className="text-xs text-gray-300 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg capitalize">{movie.category}</span>
                        )}
                      </div>

                      {movie.synopsis && (
                        <p className="text-gray-300 text-sm line-clamp-2 max-w-md">{movie.synopsis}</p>
                      )}

                      <div className="flex items-center gap-3 pt-1">
                        <Link to={`/movie/${movie.slug}`} className="btn-primary flex items-center gap-2">
                          <Play size={15} className="fill-white" />
                          View Details
                        </Link>
                        {movie.trailerUrl && (
                          <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-2 text-sm">
                            Watch Trailer
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
