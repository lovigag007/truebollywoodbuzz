import { useState } from 'react';
import { Star, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function RatingWidget({ movie, userRating, onRated, onLoginRequired }) {
  const { user } = useAuth();
  const [starHover, setStarHover] = useState(0);
  const [star, setStar] = useState(userRating?.starRating || 0);
  const [percent, setPercent] = useState(userRating?.realPercent ?? movie.avgRealPercent ?? 50);
  const [review, setReview] = useState(userRating?.review || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(!!userRating);

  const handleSubmit = async () => {
    if (!user) { onLoginRequired?.(); return; }
    if (!star && percent === null) { toast.error('Please give a star rating or % real'); return; }

    setLoading(true);
    try {
      const res = await api.post(`/movies/${movie.id}/rate`, { starRating: star || undefined, realPercent: percent, review: review || undefined });
      setSubmitted(true);
      toast.success('Rating submitted! 🎬');
      onRated?.(res.data.movie);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const pctColor = percent >= 70 ? '#22c55e' : percent >= 40 ? '#eab308' : '#ef4444';
  const pctLabel = percent >= 80 ? 'Very Accurate' : percent >= 60 ? 'Mostly Real' : percent >= 40 ? 'Partially Real' : percent >= 20 ? 'Mostly Fiction' : 'Heavily Fictionalized';

  return (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-white text-lg">Rate This Movie</h3>
        {submitted && (
          <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
            <Check size={14} /> Rated
          </span>
        )}
      </div>

      {/* Star Rating */}
      <div>
        <p className="text-gray-400 text-sm mb-3 font-medium">Your Rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => { if (!user) { onLoginRequired?.(); return; } setStar(s); setSubmitted(false); }}
              onMouseEnter={() => setStarHover(s)}
              onMouseLeave={() => setStarHover(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={32}
                className={`transition-colors ${s <= (starHover || star) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
              />
            </button>
          ))}
          {star > 0 && (
            <span className="ml-2 text-yellow-400 font-semibold text-sm">
              {['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][star]}
            </span>
          )}
        </div>
      </div>

      {/* Real Percent Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-sm font-medium">How real is this story?</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color: pctColor }}>{percent}%</span>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: `${pctColor}20`, color: pctColor }}>{pctLabel}</span>
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={percent}
            onChange={(e) => { if (!user) { onLoginRequired?.(); return; } setPercent(parseInt(e.target.value)); setSubmitted(false); }}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${pctColor} ${percent}%, #2a2a3a ${percent}%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1.5 px-1">
            <span>0% Fiction</span>
            <span>50%</span>
            <span>100% Real</span>
          </div>
        </div>
      </div>

      {/* Review */}
      <div>
        <p className="text-gray-400 text-sm mb-2 font-medium">Your Review <span className="text-gray-600">(optional)</span></p>
        <textarea
          value={review}
          onChange={(e) => { if (!user) { onLoginRequired?.(); return; } setReview(e.target.value); setSubmitted(false); }}
          placeholder="Share your thoughts about how well the movie portrays the real events..."
          rows={3}
          className="input resize-none text-sm"
        />
      </div>

      {/* Submit */}
      {!user ? (
        <button onClick={onLoginRequired} className="btn-primary w-full flex items-center justify-center gap-2">
          Login to Rate this Movie
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : submitted ? <><Check size={16} /> Update Rating</> : 'Submit Rating'}
        </button>
      )}
    </div>
  );
}
