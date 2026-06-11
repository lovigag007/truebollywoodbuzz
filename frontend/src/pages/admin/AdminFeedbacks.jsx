import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Check, Eye, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_COLORS = {
  new: 'bg-brand-500/10 text-brand-400',
  read: 'bg-blue-500/10 text-blue-400',
  replied: 'bg-green-500/10 text-green-400',
  closed: 'bg-gray-500/10 text-gray-500',
};

const TYPE_ICONS = {
  general: '💬', bug: '🐛', suggestion: '💡', movie_request: '🎬', other: '📌'
};

export default function AdminFeedbacks() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { if (!isAdmin) navigate('/'); }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/feedbacks', { params: { page, limit: 20, status: filter || undefined } });
      setFeedbacks(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFeedbacks(); }, [page, filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/feedbacks/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchFeedbacks();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Feedbacks</h1>
          {pagination && <p className="text-gray-500 text-sm mt-0.5">{pagination.total} total</p>}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ label: 'All', value: '' }, { label: '🔔 New', value: 'new' }, { label: '👁 Read', value: 'read' }, { label: '✅ Replied', value: 'replied' }, { label: '🔒 Closed', value: 'closed' }].map(f => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f.value ? 'bg-brand-500 text-white' : 'bg-cinema-card border border-cinema-border text-gray-400 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-cinema-card rounded-2xl animate-pulse" />)
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No feedbacks found</div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden">
              <div className="flex items-start gap-4 p-4 cursor-pointer" onClick={() => setExpanded(expanded === fb.id ? null : fb.id)}>
                <div className="text-2xl shrink-0">{TYPE_ICONS[fb.type] || '💬'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{fb.name || 'Anonymous'}</span>
                    {fb.user && <span className="text-gray-600 text-xs">+91 {fb.user.phone}</span>}
                    <span className={clsx('badge text-xs', STATUS_COLORS[fb.status])}>{fb.status}</span>
                    <span className="text-gray-600 text-xs capitalize ml-auto">{fb.type?.replace('_', ' ')}</span>
                  </div>
                  {fb.subject && <p className="text-gray-300 text-sm font-medium mt-0.5">{fb.subject}</p>}
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{fb.message}</p>
                </div>
                <div className="text-gray-600 text-xs shrink-0">
                  {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              {expanded === fb.id && (
                <div className="border-t border-cinema-border px-4 py-4 space-y-3 animate-fade-in">
                  {fb.email && <p className="text-gray-400 text-sm">📧 {fb.email}</p>}
                  <div className="bg-cinema-muted rounded-xl p-4">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{fb.message}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['read', 'replied', 'closed'].map(s => (
                      fb.status !== s && (
                        <button key={s} onClick={() => updateStatus(fb.id, s)}
                          className={clsx('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all', STATUS_COLORS[s], 'border-current/30 hover:opacity-80')}>
                          <Check size={11} /> Mark as {s}
                        </button>
                      )
                    ))}
                    {fb.status === 'new' && (
                      <button onClick={() => updateStatus(fb.id, 'read')}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all">
                        <Eye size={11} /> Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-ghost px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="text-gray-500 text-sm">Page {page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="btn-ghost px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
