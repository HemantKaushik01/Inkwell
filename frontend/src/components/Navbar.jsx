import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, LogOut, Bell, Menu, X, LayoutDashboard, BookOpen, Users, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../api';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Fetch unread notifications (only when user AND valid token are present)
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return; // Guard: don't fetch if token is gone (e.g. after logout)
    const fetch = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch {} // Silently ignore — 401 interceptor in api.js handles token expiry
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('You have been signed out.', 'Goodbye!');
    navigate('/');
  };

  const handleWriteClick = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (user.role === 'READER') {
      toast.warning('Authors only. Contact admin to upgrade your account.', 'Permission required');
      return;
    }
    navigate('/write');
  };

  const initials = user ? (user.fullName || user.username || '?').slice(0, 2).toUpperCase() : '';

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link to="/" className={`nav-item ${mobile ? 'w-full' : ''}`} style={mobile ? { padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' } : {}}>
        <BookOpen size={16} /> Home
      </Link>
      
      <Link to="/newsletters" className={`nav-item ${mobile ? 'w-full' : ''}`} style={mobile ? { padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' } : {}}>
        <Mail size={16} /> Newsletters
      </Link>

      <button onClick={handleWriteClick} className={`nav-item ${mobile ? 'w-full' : ''}`} style={mobile ? { padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', width: '100%', textAlign: 'left', justifyContent: 'flex-start' } : {}}>
        <PenSquare size={16} /> Write
      </button>

      {user ? (
        <>
          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin" className="nav-item" style={mobile ? { padding: '0.875rem 1rem', display: 'flex', width: '100%' } : {}}>
                <LayoutDashboard size={16} /> Admin
              </Link>
              <Link to="/user-profiles" className="nav-item" style={mobile ? { padding: '0.875rem 1rem', display: 'flex', width: '100%' } : {}}>
                <Users size={16} /> Users
              </Link>
            </>
          )}
          {(user.role === 'AUTHOR' || user.role === 'ADMIN') && (
            <Link to="/my-stories" className="nav-item" style={mobile ? { padding: '0.875rem 1rem', display: 'flex', width: '100%' } : {}}>
              My Stories
            </Link>
          )}

          {!mobile && (
            <Link to="/notifications" className="nav-item nav-notification-btn" title="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </Link>
          )}

          {mobile && (
            <Link to="/notifications" className="nav-item" style={{ padding: '0.875rem 1rem', display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={16} /> Notifications</span>
              {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}
            </Link>
          )}

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: mobile ? '0.5rem 1rem' : '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--color-border)', transition: 'var(--transition-fast)', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div className="nav-avatar">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.username || user.fullName}</span>
            </div>
          </Link>

          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={15} /> {mobile ? 'Sign Out' : ''}
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="nav-item">Sign In</Link>
          <Link to="/login?mode=signup" className="btn btn-primary btn-sm btn-pill">
            Get Started →
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-content">
          <Link to="/" className="nav-brand">InkWell.</Link>

          {/* Desktop links */}
          <div className="nav-links" style={{ gap: '0.2rem' }}>
            <NavLinks />
          </div>

          {/* Mobile right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="mobile-menu-btn-wrap">
            <ThemeToggle />
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`nav-drawer${mobileOpen ? ' open' : ''}`} ref={drawerRef}>
        <div className="nav-drawer-overlay" onClick={() => setMobileOpen(false)} />
        <div className="nav-drawer-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>InkWell.</span>
            <button className="btn-ghost btn-icon" onClick={() => setMobileOpen(false)}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <NavLinks mobile />
          </div>
        </div>
      </div>
    </>
  );
}
