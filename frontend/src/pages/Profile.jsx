import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Save, Key, AlertCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [name, setName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const clearMessage = () => setMessage({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      const res = await api.put('/users/profile', {
        fullName: name,
        username,
        bio,
        avatarUrl
      });
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match.' });
    }
    setLoading(true);
    clearMessage();
    try {
      await api.put('/auth/password', {
        oldPassword,
        newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section animate-fade-in">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>My Profile</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
          {/* Sidebar Tabs */}
          <aside>
            <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('info')}
                className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)' }}
              >
                <User size={18} style={{ marginRight: '0.8rem' }} /> Profile Info
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)' }}
              >
                <Shield size={18} style={{ marginRight: '0.8rem' }} /> Account Security
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="card" style={{ padding: '3rem' }}>
            {message.text && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '2rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem',
                backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${message.type === 'success' ? '#bcf0da' : '#f87171'}`
              }}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}

            {activeTab === 'info' ? (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`} 
                      alt="Avatar" 
                      style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: 'var(--shadow-lg)' }} 
                    />
                    <div style={{ position: 'absolute', bottom: '5px', right: '5px', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                      <Camera size={16} />
                    </div>
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>{user?.fullName}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{user?.email}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Avatar URL</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio (Tell the world your story)</label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Writers, dreamers, and early adopters..."
                    style={{ resize: 'none' }}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                  <Save size={18} style={{ marginRight: '0.8rem' }} /> {loading ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Change Password</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '2rem' }}>
                  <Key size={18} style={{ marginRight: '0.8rem' }} /> {loading ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
