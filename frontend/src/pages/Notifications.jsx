import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Bell, CheckCircle, Trash2, MessageSquare, Heart, UserPlus, CheckCheck, X } from 'lucide-react';

const TYPE_META = {
  NEW_COMMENT:  { icon: <MessageSquare size={16} />, color: 'var(--color-primary)',  bg: 'var(--color-primary-subtle)' },
  NEW_REPLY:    { icon: <MessageSquare size={16} />, color: 'var(--color-primary)',  bg: 'var(--color-primary-subtle)' },
  NEW_LIKE:     { icon: <Heart size={16} />,         color: 'var(--color-danger)',   bg: 'var(--color-danger-subtle)'  },
  NEW_FOLLOWER: { icon: <UserPlus size={16} />,      color: 'var(--color-success)', bg: 'var(--color-success-subtle)' },
  DEFAULT:      { icon: <Bell size={16} />,          color: 'var(--color-text-3)',  bg: 'var(--color-bg-3)'           },
};

function groupByDate(notifications) {
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach(n => {
    const d = new Date(n.createdAt); d.setHours(0,0,0,0);
    if (d >= today) groups.Today.push(n);
    else if (d >= yesterday) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });
  return groups;
}

export default function Notifications() {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(res => setNotifications(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { toast.error('Failed to mark as read.'); }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(ns => ns.filter(n => n.id !== id));
    } catch { toast.error('Failed to delete.'); }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(ns => ns.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch { toast.error('Failed to mark all as read.'); }
  };

  const clearRead = async () => {
    try {
      await api.delete('/notifications/delete-read');
      setNotifications(ns => ns.filter(n => !n.read));
      toast.info('Cleared read notifications.');
    } catch { toast.error('Failed to clear.'); }
  };

  const getLink = (n) => {
    if (n.relatedType === 'POST' && n.relatedSlug) return `/post/${n.relatedSlug}`;
    if (n.relatedType === 'COMMENT' && n.relatedSlug) return `/post/${n.relatedSlug}#comment-${n.relatedId}`;
    return null;
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const unread = notifications.filter(n => !n.read).length;
  const groups = groupByDate(notifications);

  return (
    <div className="container section animate-fade-in">
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>Notifications</h1>
            {unread > 0 && <p style={{ color: 'var(--color-text-3)', fontSize: '0.88rem' }}>{unread} unread</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={markAllRead} className="btn btn-secondary btn-sm" disabled={unread === 0}>
              <CheckCheck size={14} /> Mark all read
            </button>
            <button onClick={clearRead} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}
              disabled={notifications.every(n => !n.read)}>
              <X size={14} /> Clear read
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Bell size={28} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>You're all caught up!</h3>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>No notifications yet. Start reading and engaging with stories.</p>
          </div>
        ) : (
          <div>
            {Object.entries(groups).map(([group, items]) => {
              if (!items.length) return null;
              return (
                <div key={group} style={{ marginBottom: '2rem' }}>
                  <div className="section-label" style={{ marginBottom: '1rem' }}>{group}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map(n => {
                      const meta = TYPE_META[n.type] || TYPE_META.DEFAULT;
                      const link = getLink(n);
                      return (
                        <div key={n.id}
                          className="card"
                          style={{
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            opacity: n.read ? 0.65 : 1,
                            borderLeft: n.read ? 'none' : `3px solid ${meta.color}`,
                            transition: 'var(--transition)'
                          }}
                        >
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {meta.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: n.read ? 400 : 600, fontSize: '0.9rem', lineHeight: 1.5 }}>{n.message}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                              {link && (
                                <Link to={link} onClick={() => !n.read && markAsRead(n.id)}
                                  style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                  View →
                                </Link>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                            {!n.read && (
                              <button onClick={() => markAsRead(n.id)} className="btn btn-ghost btn-icon btn-sm" title="Mark as read">
                                <CheckCircle size={15} />
                              </button>
                            )}
                            <button onClick={() => deleteNotification(n.id)} className="btn btn-ghost btn-icon btn-sm" title="Delete"
                              style={{ color: 'var(--color-danger)' }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
