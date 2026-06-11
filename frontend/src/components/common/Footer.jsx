import { Link } from 'react-router-dom';
import { Film, Heart, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cinema-border bg-cinema-card mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Film size={18} className="text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-xl">Bollywood</span>
                <span className="font-display font-bold text-brand-500 text-xl">Real</span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              India's go-to platform for Bollywood movies based on true events. Rate, review, and discover how real your favourite films really are.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 bg-cinema-muted hover:bg-brand-500/20 border border-cinema-border hover:border-brand-500/40 rounded-xl flex items-center justify-center text-gray-500 hover:text-brand-400 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'All Movies', path: '/movies' },
                { label: 'Biographical', path: '/movies?category=biographical' },
                { label: 'Crime Stories', path: '/movies?category=crime' },
                { label: 'War Movies', path: '/movies?category=war' },
                { label: 'Sports Stories', path: '/movies?category=sports' },
                { label: 'Political Drama', path: '/movies?category=political' },
              ].map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-500 hover:text-white text-sm transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Site</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Send Feedback', path: '/feedback' },
                { label: 'Request a Movie', path: '/feedback' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Use', path: '/terms' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-gray-500 hover:text-white text-sm transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-cinema-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} BollywoodReal. All rights reserved.</p>
          <p className="text-gray-600 text-sm flex items-center gap-1.5">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
