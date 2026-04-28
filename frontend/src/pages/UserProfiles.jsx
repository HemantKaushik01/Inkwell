import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { Search, Users, Trash2, ChevronDown } from 'lucide-react';

const ROLE_BADGES = {
  ADMIN:  { class: 'badge-danger',  label: 'Admin' },
  AUTHOR: { class: 'badge-primary', label: 'Author' },
  READER: { class: 'badge-neutral', label: 'Reader' },
};

export default function UserProfiles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    api.get('/admin/users')
      .then(res => setUsers(res.data || []))
      .catch(() => toast.error('Failed to load user profiles.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated successfully.');
    } catch { toast.error('Failed to update role.'); }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}" (ID: ${userId})?\n\nThis action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(us => us.filter(u => u.id !== userId));
      toast.success(`User "${username}" deleted.`);
    } catch { toast.error('Failed to delete user. They may be referenced in other data.'); }
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (u.username || '').toLowerCase().includes(q)
        || (u.fullName || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '3rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>User Management</h1>
        <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>
          Manage all {users.length} platform accounts · Change roles or remove users.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
          <input type="text" className="form-input" placeholder="Search by name, username, email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: '38px', fontSize: '0.88rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'ADMIN', 'AUTHOR', 'READER'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', fontSize: '0.78rem' }}>
              {r === 'ALL' ? 'All Roles' : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-3)', alignSelf: 'center' }}>
          {filtered.length} of {users.length} users
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={28} /></div>
          <h3>No users found</h3>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const roleM = ROLE_BADGES[u.role] || ROLE_BADGES.READER;
                const initials = (u.username || '?').slice(0, 2).toUpperCase();
                const isSelf = user.id === u.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, overflow: 'hidden' }}>
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.fullName || u.username}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            @{u.username} · {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                          disabled={isSelf}
                          style={{
                            appearance: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                            padding: '0.3rem 1.75rem 0.3rem 0.6rem', fontSize: '0.82rem', fontWeight: 600, cursor: isSelf ? 'not-allowed' : 'pointer',
                            background: 'var(--color-surface)', color: 'var(--color-text)', opacity: isSelf ? 0.5 : 1,
                            fontFamily: 'inherit', transition: 'border-color 0.15s',
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                        >
                          <option value="READER">Reader</option>
                          <option value="AUTHOR">Author</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleDeleteUser(u.id, u.username)}
                          className="btn btn-sm btn-icon" disabled={isSelf}
                          style={{ color: 'var(--color-danger)', background: 'var(--color-danger-subtle)', opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                          title="Delete user">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
