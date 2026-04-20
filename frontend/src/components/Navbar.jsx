import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };
    if (user) {
      fetchUnreadCount();
      // Polling for demo purposes, or just fetch once
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleWriteClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
    } else if (user.role === 'READER') {
      alert("You need to be an Author to write stories. Please contact admin to upgrade your account.");
    } else {
      navigate('/write');
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="nav-brand">InkWell.</Link>
        <div className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <a href="#newsletter" className="nav-item flex items-center gap-1">
            <Bell size={16} /> Subscribe
          </a>
          <button onClick={handleWriteClick} className="nav-item flex items-center gap-2" style={{ fontWeight: '600' }}>
            <PenSquare size={18} /> Write
          </button>
          
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="nav-item">Admin</Link>
              )}
              {(user.role === 'AUTHOR' || user.role === 'ADMIN') && (
                <Link to="/my-stories" className="nav-item">My Stories</Link>
              )}
              <Link to="/notifications" className="nav-item" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-5px', 
                    right: '-5px', 
                    backgroundColor: '#dc2626', 
                    color: 'white', 
                    borderRadius: '50%', 
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    border: '2px solid white'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="nav-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg)', padding: '0.4rem 1.1rem', borderRadius: '2rem', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-text)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                  <UserIcon size={16} />
                  <span style={{ fontWeight: 600 }}>{user.username || user.name}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Sign In</Link>
              <Link to="/login?mode=signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
