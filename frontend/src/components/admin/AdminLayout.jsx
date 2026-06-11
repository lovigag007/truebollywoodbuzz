import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, Users, MessageSquare, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Movies', path: '/admin/movies', icon: Film },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Feedbacks', path: '/admin/feedbacks', icon: MessageSquare },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-cinema-card border-r border-cinema-border hidden lg:flex flex-col">
        <div className="p-5 border-b border-cinema-border">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Site
          </Link>
          <p className="text-white font-display font-bold">Admin Panel</p>
          <p className="text-gray-500 text-xs mt-0.5">{user?.name || user?.phone}</p>
        </div>
        <nav className="p-3 flex-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = pathname === path || (path !== '/admin' && pathname.startsWith(path));
            return (
              <Link key={path} to={path}
                className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all', {
                  'bg-brand-500/15 text-brand-400': active,
                  'text-gray-400 hover:text-white hover:bg-cinema-muted': !active,
                })}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-cinema-border">
          <Link to="/admin/movies/new" className="flex items-center gap-2 btn-primary text-sm w-full justify-center">
            <Plus size={14} /> Add Movie
          </Link>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-cinema-card border-t border-cinema-border flex">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = pathname === path || (path !== '/admin' && pathname.startsWith(path));
          return (
            <Link key={path} to={path} className={clsx('flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors', {
              'text-brand-400': active,
              'text-gray-500': !active,
            })}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
