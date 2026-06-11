import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, Settings, Film, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../auth/LoginModal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSuggestions([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(debounceRef.current);
    if (q.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(`/movies/search/suggestions?q=${q}`);
        setSuggestions(res.data.data);
      } catch {} finally { setSearchLoading(false); }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSuggestions([]);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toast.success('Logged out');
  };

  const categories = [
    { label: 'Biographical', path: '/movies?category=biographical' },
    { label: 'War', path: '/movies?category=war' },
    { label: 'Crime', path: '/movies?category=crime' },
    { label: 'Sports', path: '/movies?category=sports' },
    { label: 'Historical', path: '/movies?category=historical' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-cinema-dark/90 backdrop-blur-xl border-b border-cinema-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Film size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-white text-lg leading-none">Bollywood</span>
              <span className="font-display font-bold text-brand-500 text-lg leading-none">Real</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Home</Link>
            <Link to="/movies" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">All Movies</Link>
            {categories.slice(0, 3).map((c) => (
              <Link key={c.path} to={c.path} className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">{c.label}</Link>
            ))}
            <Link to="/feedback" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Feedback</Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.querySelector('input')?.focus(), 100); }}
                className="p-2 text-gray-400 hover:text-white hover:bg-cinema-muted rounded-lg transition-all"
              >
                <Search size={18} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-cinema-card border border-cinema-border rounded-xl shadow-2xl animate-fade-in">
                  <form onSubmit={handleSearchSubmit} className="p-3">
                    <div className="flex items-center gap-2 bg-cinema-muted rounded-lg px-3 py-2">
                      <Search size={14} className="text-gray-500 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search movies..."
                        className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-500"
                        autoFocus
                      />
                    </div>
                  </form>
                  {suggestions.length > 0 && (
                    <div className="border-t border-cinema-border pb-2">
                      {suggestions.map((m) => (
                        <Link
                          key={m.id}
                          to={`/movie/${m.slug}`}
                          onClick={() => { setSearchOpen(false); setSuggestions([]); setSearchQuery(''); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-cinema-muted transition-colors"
                        >
                          <img src={m.posterUrl || '/placeholder.jpg'} alt={m.title} className="w-8 h-10 object-cover rounded" />
                          <div>
                            <p className="text-sm text-white font-medium">{m.title}</p>
                            <p className="text-xs text-gray-500">{m.year}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-cinema-muted hover:bg-cinema-border px-3 py-1.5 rounded-xl transition-all"
                >
                  <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {(user.name || user.phone)[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 hidden sm:block max-w-[80px] truncate">{user.name || user.phone}</span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-cinema-card border border-cinema-border rounded-xl shadow-2xl animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-cinema-border">
                      <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500">+91 {user.phone}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-400 hover:bg-cinema-muted transition-colors">
                        <Settings size={14} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-cinema-muted transition-colors">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                <User size={14} /> <span>Login</span>
              </button>
            )}

            {/* Mobile Menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-cinema-muted rounded-lg transition-all">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-cinema-border bg-cinema-card animate-slide-in">
            <div className="px-4 py-3 space-y-1">
              {[
                { label: 'Home', path: '/' },
                { label: 'All Movies', path: '/movies' },
                ...categories,
                { label: 'Feedback', path: '/feedback' },
              ].map((item) => (
                <Link key={item.path} to={item.path} className="block px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-cinema-muted text-sm transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
