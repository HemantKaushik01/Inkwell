import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle, Trash2, MessageSquare, Heart, UserPlus } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const clearRead = async () => {
    try {
      await api.delete('/notifications/delete-read');
      setNotifications(notifications.filter(n => !n.read));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationLink = (n) => {
    if (n.relatedType === 'POST' && n.relatedSlug) return `/post/${n.relatedSlug}`;
    if (n.relatedType === 'COMMENT' && n.relatedSlug) return `/post/${n.relatedSlug}#comment-${n.relatedId}`;
    return null;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'NEW_COMMENT':
      case 'NEW_REPLY':
        return <MessageSquare size={18} className="text-primary" />;
      case 'NEW_LIKE':
        return <Heart size={18} style={{ color: '#dc2626' }} />;
      case 'NEW_FOLLOWER':
        return <UserPlus size={18} className="text-secondary" />;
      default:
        return <Bell size={18} />;
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="container section animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0 }}>Notifications</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={markAllRead} className="btn btn-outline btn-sm">Mark all read</button>
            <button onClick={clearRead} className="btn btn-outline btn-sm" style={{ color: '#dc2626' }}>Clear read</button>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--color-secondary-bg)', borderRadius: 'var(--radius-lg)' }}>
            <Bell size={48} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                className="card animate-slide-in" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem',
                  opacity: n.read ? 0.7 : 1,
                  borderLeft: n.read ? 'none' : '4px solid var(--color-accent)'
                }}
              >
                <div style={{ 
                  backgroundColor: 'var(--color-bg)', 
                  padding: '0.75rem', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(n.type)}
                </div>
                
                <div style={{ flexGrow: 1 }}>
                  <p style={{ margin: 0, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {getNotificationLink(n) && (
                      <Link to={getNotificationLink(n)} className="text-sm" style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                        View details →
                      </Link>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="btn btn-sm btn-outline" title="Mark as read">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="btn btn-sm btn-outline" style={{ color: '#dc2626' }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
