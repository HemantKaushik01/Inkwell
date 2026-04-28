import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, Heart, Calendar, UserPlus, UserCheck } from 'lucide-react';
import { SkeletonCard } from '../components/SkeletonCard';

export default function AuthorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [authorRes, postsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/posts/author/${id}`),
        ]);
        setAuthor(authorRes.data);
        setPosts(postsRes.data || []);
        if (user) {
          try {
            const followRes = await api.get(`/users/${user.id}/following`);
            setIsFollowing(followRes.data.some(u => String(u.id) === String(id)));
          } catch {}
        }
      } catch { toast.error('Failed to load author profile.'); }
      finally { setLoading(false); }
    })();
  }, [id, user]);

  const handleFollowToggle = async () => {
    if (!user) { toast.info('Sign in to follow authors.'); return; }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${id}/follow`);
        setIsFollowing(false);
      } else {
        await api.post(`/users/${id}/follow`);
        setIsFollowing(true);
        toast.success(`Now following ${author.fullName || author.username}!`, 'Following!');
      }
    } catch { toast.error('Failed to update follow status.'); }
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <div className="container section">
      <div style={{ height: 280, background: 'var(--color-bg-3)', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} className="skeleton" />
      <div className="post-grid">{[1,2,3].map(n => <SkeletonCard key={n} />)}</div>
    </div>
  );
  if (!author) return <div className="container section"><h2>Author not found</h2></div>;

  const initials = (author.fullName || author.username || '?').slice(0, 2).toUpperCase();
  const totalViews = posts.reduce((a, p) => a + (p.viewCount || 0), 0);
  const totalLikes = posts.reduce((a, p) => a + (p.likeCount || 0), 0);
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  const isSelf = user && String(user.id) === String(id);

  return (
    <div className="animate-fade-in">
      {/* ——— Hero Banner ——— */}
      <div style={{
        background: 'var(--gradient-brand)',
        padding: '4rem 0 6rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-mesh)', opacity: 0.12, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.6)', overflow: 'hidden', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '2rem', flexShrink: 0 }}>
            {author.avatarUrl
              ? <img src={author.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ flex: 1, color: 'white' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.3rem', color: 'white' }}>
              {author.fullName || author.username}
            </h1>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '1rem' }}>@{author.username}</p>
            {author.bio && <p style={{ opacity: 0.85, fontSize: '1rem', lineHeight: 1.6, maxWidth: '500px', marginBottom: '1.25rem' }}>{author.bio}</p>}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.8, fontSize: '0.88rem' }}>
                <Calendar size={14} /> Joined {new Date(author.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.8, fontSize: '0.88rem' }}>
                <Eye size={14} /> {totalViews.toLocaleString()} views
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.8, fontSize: '0.88rem' }}>
                <Heart size={14} /> {totalLikes.toLocaleString()} likes
              </span>
            </div>
          </div>
          {!isSelf && (
            <button onClick={handleFollowToggle} disabled={followLoading}
              className={`btn btn-lg btn-pill ${isFollowing ? 'btn-secondary' : ''}`}
              style={!isFollowing ? { background: 'white', color: 'var(--color-primary)', fontWeight: 700 } : {}}
            >
              {followLoading
                ? <span className="spinner-sm" />
                : isFollowing
                  ? <><UserCheck size={16} /> Following</>
                  : <><UserPlus size={16} /> Follow</>
              }
            </button>
          )}
        </div>
      </div>

      {/* ——— Stats Row ——— */}
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="container" style={{ display: 'flex', gap: '3rem', padding: '1.25rem 2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Stories', value: publishedPosts.length },
            { label: 'Total Views', value: totalViews.toLocaleString() },
            { label: 'Total Likes', value: totalLikes.toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ——— Posts ——— */}
      <div className="container section">
        <div className="section-label" style={{ marginBottom: '1.5rem' }}>
          Published Stories — {publishedPosts.length}
        </div>

        {publishedPosts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {publishedPosts.map(post => (
              <div key={post.id}
                style={{ display: 'grid', gridTemplateColumns: post.coverImageUrl ? '1fr 2fr' : '1fr', gap: '1.5rem', padding: '2rem 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 'var(--radius-sm)' }}
                onClick={() => navigate(`/post/${post.slug}`)}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--color-bg-2)'; e.currentTarget.style.paddingLeft = '0.75rem'; e.currentTarget.style.paddingRight = '0.75rem'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.paddingRight = '0'; }}
              >
                {post.coverImageUrl && (
                  <img src={post.coverImageUrl} alt={post.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} loading="lazy" />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="post-meta" style={{ marginBottom: '0.5rem' }}>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>{post.readTime} min read</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.35, marginBottom: '0.5rem' }}>{post.title}</h3>
                  <p style={{ color: 'var(--color-text-3)', fontSize: '0.92rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    {(post.content || '').substring(0, 150)}…
                  </p>
                  <div className="post-stats">
                    <span className="post-stat" style={{ fontSize: '0.78rem' }}><Eye size={12} />{post.viewCount || 0}</span>
                    <span className="post-stat" style={{ fontSize: '0.78rem' }}><Heart size={12} />{post.likeCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No published stories yet</h3>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>This author hasn't published any stories yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
