import { useState } from 'react';
import { Share2, MessageCircle, Twitter, Facebook, Link2, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ShareButtons({ movie }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/movie/${movie.slug}`;
  const text = `🎬 ${movie.title} (${movie.year}) — ${Math.round(movie.avgRealPercent ?? movie.defaultRealPercent ?? 50)}% Real Story\nCheck it out on BollywoodReal!`;

  const trackShare = () => {
    api.post(`/movies/${movie.id}/share`).catch(() => {});
  };

  const shareWhatsApp = () => {
    trackShare();
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
  };

  const shareTwitter = () => {
    trackShare();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareFacebook = () => {
    trackShare();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare();
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Failed to copy'); }
  };

  const nativeShare = () => {
    if (navigator.share) {
      trackShare();
      navigator.share({ title: movie.title, text, url });
    }
  };

  return (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={16} className="text-brand-400" />
        <h3 className="font-semibold text-white text-sm">Share this Movie</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl text-sm font-medium transition-all"
        >
          <MessageCircle size={15} /> WhatsApp
        </button>
        <button
          onClick={shareTwitter}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 text-[#1DA1F2] rounded-xl text-sm font-medium transition-all"
        >
          <Twitter size={15} /> Twitter
        </button>
        <button
          onClick={shareFacebook}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl text-sm font-medium transition-all"
        >
          <Facebook size={15} /> Facebook
        </button>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-3.5 py-2 bg-cinema-muted hover:bg-cinema-border border border-cinema-border text-gray-300 rounded-xl text-sm font-medium transition-all"
        >
          {copied ? <Check size={15} className="text-green-400" /> : <Link2 size={15} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        {typeof navigator.share === 'function' && (
          <button
            onClick={nativeShare}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 rounded-xl text-sm font-medium transition-all"
          >
            <Share2 size={15} /> More
          </button>
        )}
      </div>
    </div>
  );
}
