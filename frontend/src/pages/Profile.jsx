import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Shield, Camera, Save, Key, BookOpen, Heart, Eye } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ posts: 0, views: 0, likes: 0 });

  const [name, setName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user && (user.role === 'AUTHOR' || user.role === 'ADMIN')) {
      api.get(`/posts/author/${user.id}`).then(res => {
        const posts = res.data || [];
        setStats({
          posts: posts.length,
          views: posts.reduce((a, p) => a + (p.viewCount || 0), 0),
          likes: posts.reduce((a, p) => a + (p.likeCount || 0), 0),
        });
      }).catch(() => {});
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { fullName: name, username, bio, avatarUrl });
      updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.put('/auth/password', { oldPassword, newPassword });
      toast.success('Password changed successfully!');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setLoading(false); }
  };

  const TABS = [
    { id: 'info', label: 'Profile Info', icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  ];

  if (!user) return null;
  const initials = (user.fullName || user.username || '?').slice(0, 2).toUpperCase();

  return (
    <div className="container section animate-fade-in">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Profile Header Card */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem', alignItems: 'center' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', border: '3px solid var(--color-border)', overflow: 'hidden', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '2rem' }}>
              {avatarUrl || user.avatarUrl
                ? <img src={avatarUrl || user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <label title="Change avatar URL" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--color-bg)' }}>
              <Camera size={13} color="white" />
            </label>
          </div>
          {/* Info */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>{user.fullName || user.username}</h2>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.88rem', marginBottom: '0.4rem' }}>@{user.username} · {user.email}</p>
            <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : user.role === 'AUTHOR' ? 'badge-primary' : 'badge-neutral'}`}>
              {user.role}
            </span>
          </div>
          {/* Stats */}
          {(user.role === 'AUTHOR' || user.role === 'ADMIN') && (
            <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
              {[
                { label: 'Stories', value: stats.posts, icon: <BookOpen size={16} /> },
                { label: 'Views', value: stats.views.toLocaleString(), icon: <Eye size={16} /> },
                { label: 'Likes', value: stats.likes.toLocaleString(), icon: <Heart size={16} /> },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>{s.icon} {s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
          {/* Sidebar Tabs */}
          <aside>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'sticky', top: 80 }}>
              {TABS.map(tab => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`admin-nav-item${activeTab === tab.id ? ' active' : ''}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="card" style={{ padding: '2.5rem' }}>
            {activeTab === 'info' ? (
              <form onSubmit={handleUpdateProfile}>
                <h3 style={{ marginBottom: '1.75rem', fontWeight: 800 }}>Profile Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Username</label>
                    <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label className="form-label"><Camera size={14} /> Avatar URL</label>
                  <input type="text" className="form-input" placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
                  {avatarUrl && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={avatarUrl} alt="Preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }} onError={e => e.target.style.display = 'none'} />
                      <span className="text-sm text-muted">Avatar preview</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={4} value={bio} onChange={e => setBio(e.target.value)}
                    placeholder="Tell the world your story…" style={{ resize: 'none' }} />
                  <div className="form-hint">{bio.length}/200 characters</div>
                </div>
                <button type="submit" className="btn btn-primary btn-pill" disabled={loading} style={{ marginTop: '0.5rem' }}>
                  <Save size={16} /> {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword}>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Change Password</h3>
                <p style={{ color: 'var(--color-text-3)', fontSize: '0.88rem', marginBottom: '2rem' }}>
                  Choose a strong, unique password to keep your account secure.
                </p>
                <div className="form-group">
                  <label className="form-label"><Key size={14} /> Current Password</label>
                  <input type="password" className="form-input" value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <div className="divider" style={{ margin: '1.5rem 0' }} />
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" placeholder="Min. 8 characters" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <div className="form-error">Passwords do not match</div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-pill" disabled={loading || (confirmPassword && newPassword !== confirmPassword)}>
                  <Shield size={16} /> {loading ? 'Updating…' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
