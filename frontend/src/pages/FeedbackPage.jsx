import { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'general', label: '💬 General' },
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'suggestion', label: '💡 Suggestion' },
  { value: 'movie_request', label: '🎬 Movie Request' },
  { value: 'other', label: '📌 Other' },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: '', subject: '', message: '', type: 'general' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim() || form.message.trim().length < 10) {
      toast.error('Please write at least 10 characters'); return;
    }
    setLoading(true);
    try {
      await api.post('/feedback', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
      <h2 className="font-display text-3xl font-bold text-white mb-3">Thank You!</h2>
      <p className="text-gray-400 mb-8">Your feedback has been received. We appreciate you helping us improve BollywoodReal!</p>
      <button onClick={() => setSubmitted(false)} className="btn-ghost">Send More Feedback</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 min-h-screen">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={28} className="text-brand-400" />
        </div>
        <h1 className="section-title mb-2">Send Feedback</h1>
        <p className="text-gray-500">Help us improve — report issues, suggest movies, or share ideas</p>
      </div>

      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Feedback Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => set('type', t.value)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${form.type === t.value ? 'bg-brand-500 text-white' : 'bg-cinema-muted text-gray-400 hover:text-white border border-cinema-border'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          {!user && (
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Your Name</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Optional" className="input" />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Email <span className="text-gray-600">(optional — for reply)</span></label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="your@email.com" className="input" />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Subject</label>
            <input type="text" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Brief description" className="input" />
          </div>

          {/* Message */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Message <span className="text-red-400">*</span></label>
            <textarea
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder={form.type === 'movie_request'
                ? "Tell us the movie name, year, and why it should be on BollywoodReal..."
                : "Share your thoughts, ideas, or issues..."}
              rows={5}
              required
              className="input resize-none"
            />
            <p className="text-gray-600 text-xs mt-1 text-right">{form.message.length} chars</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Send Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
}
