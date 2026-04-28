import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Edit, Trash2, Eye, Heart, Plus, LayoutGrid, List, Search } from 'lucide-react';

const STATUS_META = {
  PUBLISHED: { label: 'Published', class: 'badge-success' },
  DRAFT:     { label: 'Draft',     class: 'badge-neutral' },
  ARCHIVED:  { label: 'Archived', class: 'badge-warning' },
};

export default function MyPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' | 'grid'
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'READER') { navigate('/'); return; }
    api.get(`/posts/author/${user.id}`)
      .then(res => setPosts(res.data || []))
      .catch(() => toast.error('Failed to load stories.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(p => p.filter(x => x.id !== postId));
      toast.success('Story deleted.');
    } catch { toast.error('Failed to delete story.'); }
  };

  const filtered = posts.filter(p => {
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalViews = posts.reduce((a, p) => a + (p.viewCount || 0), 0);
  const totalLikes = posts.reduce((a, p) => a + (p.likeCount || 0), 0);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container section animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Your Stories</h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>Manage and track the performance of your articles.</p>
        </div>
        <Link to="/write" className="btn btn-primary btn-pill">
          <Plus size={16} /> Write a story
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Stories', value: posts.length, icon: <Edit size={18} />, color: 'var(--color-primary)' },
          { label: 'Total Views',   value: totalViews.toLocaleString(), icon: <Eye size={18} />, color: 'var(--color-success)' },
          { label: 'Total Likes',   value: totalLikes.toLocaleString(), icon: <Heart size={18} />, color: 'var(--color-danger)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
            <div className="stat-card-number">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
          <input type="text" className="form-input" placeholder="Search stories…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: '38px', fontSize: '0.88rem' }} />
        </div>
        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'PUBLISHED', 'DRAFT'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', fontSize: '0.78rem' }}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {/* View toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem', background: 'var(--color-bg-3)', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
          {[['table', <List size={15} />], ['grid', <LayoutGrid size={15} />]].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`btn btn-sm btn-icon ${view === v ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'calc(var(--radius-sm) - 2px)' }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Edit size={28} /></div>
          <h3 style={{ marginBottom: '0.5rem' }}>{search ? 'No results found' : 'No stories yet'}</h3>
          <p style={{ color: 'var(--color-text-3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {search ? `No stories matching "${search}"` : "You haven't written any stories yet."}
          </p>
          {!search && <Link to="/write" className="btn btn-primary btn-pill">Start writing →</Link>}
        </div>
      ) : view === 'table' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Stats</th>
                <th>Published</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.id}>
                  <td>
                    <Link to={`/post/${post.slug}`} style={{ fontWeight: 700, fontSize: '0.92rem' }}
                      onMouseOver={e => e.target.style.color = 'var(--color-primary)'}
                      onMouseOut={e => e.target.style.color = 'var(--color-text)'}
                    >{post.title}</Link>
                  </td>
                  <td>
                    <span className={`badge ${(STATUS_META[post.status] || STATUS_META.DRAFT).class}`}>
                      {(STATUS_META[post.status] || STATUS_META.DRAFT).label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Eye size={13} />{post.viewCount || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Heart size={13} />{post.likeCount || 0}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <Link to={`/edit/${post.id}`} className="btn btn-secondary btn-sm btn-icon" title="Edit"><Edit size={14} /></Link>
                      <button onClick={() => handleDelete(post.id)} className="btn btn-sm btn-icon" title="Delete"
                        style={{ color: 'var(--color-danger)', background: 'var(--color-danger-subtle)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="post-grid">
          {filtered.map(post => (
            <div key={post.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 140, background: 'var(--color-bg-3)', overflow: 'hidden', position: 'relative' }}>
                {post.coverImageUrl
                  ? <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📝</div>
                }
                <span className={`badge ${(STATUS_META[post.status] || STATUS_META.DRAFT).class}`}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                  {(STATUS_META[post.status] || STATUS_META.DRAFT).label}
                </span>
              </div>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  <Link to={`/post/${post.slug}`}>{post.title}</Link>
                </h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--color-text-3)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Eye size={12} />{post.viewCount || 0}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Heart size={12} />{post.likeCount || 0}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                  <Link to={`/edit/${post.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}><Edit size={13} /> Edit</Link>
                  <button onClick={() => handleDelete(post.id)} className="btn btn-sm btn-icon" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-subtle)' }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
