import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, UserX, Shield, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { if (!isAdmin) navigate('/'); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit: 20, search } });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const toggleUser = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user.id}/toggle`);
      toast.success(res.data.message);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Manage Users</h1>
          {pagination && <p className="text-gray-500 text-sm mt-0.5">{pagination.total} users registered</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-cinema-card border border-cinema-border rounded-xl px-4 py-2.5 mb-6 max-w-md">
        <Search size={16} className="text-gray-500 shrink-0" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or phone..."
          className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-500" />
      </div>

      <div className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="text-left text-gray-500 font-medium px-4 py-3">User</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Phone</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Role</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Ratings</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-cinema-border/50">
                    <td className="px-4 py-3" colSpan={7}><div className="h-7 bg-cinema-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-10">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-cinema-border/50 hover:bg-cinema-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-brand-400 text-sm font-bold">{(user.name || user.phone)[0].toUpperCase()}</span>
                        </div>
                        <span className="text-white font-medium">{user.name || <span className="text-gray-500 italic">No name</span>}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">+91 {user.phone}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.role === 'admin'
                        ? <span className="flex items-center gap-1 text-brand-400 text-xs"><Shield size={12} /> Admin</span>
                        : <span className="text-gray-500 text-xs">User</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400/60" />
                        <span className="text-gray-400 text-xs">{user.totalRatings}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <button onClick={() => toggleUser(user)}
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                            user.isActive
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                              : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                          }`}>
                          {user.isActive ? <><UserX size={12} /> Ban</> : <><UserCheck size={12} /> Unban</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-cinema-border">
            <p className="text-gray-500 text-sm">Page {page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
