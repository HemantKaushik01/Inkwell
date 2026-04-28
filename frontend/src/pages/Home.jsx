import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Eye, Heart, TrendingUp, Search, ArrowRight, Sparkles } from 'lucide-react';
import { SkeletonCard } from '../components/SkeletonCard';
import { useToast } from '../context/ToastContext';

function PostCard({ post, onClick }) {
  const initials = (post.authorName || '?').slice(0, 2).toUpperCase();
  return (
    <div className="post-card animate-fade-in" onClick={onClick}>
      <div className="post-image-wrap">
        {post.coverImageUrl ? (
          <img className="post-image" src={post.coverImageUrl} alt={post.title} loading="lazy" />
        ) : (
          <div className="post-image-placeholder">
            {['📝', '✍️', '📖', '💡', '🌟'][post.id % 5]}
          </div>
        )}
        {post.categoryName && (
          <span style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem',
            background: 'hsla(0,0%,0%,0.65)', backdropFilter: 'blur(8px)',
            color: 'white', fontSize: '0.72rem', fontWeight: 700,
            padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)',
            letterSpacing: '0.04em', textTransform: 'uppercase'
          }}>
            {post.categoryName}
          </span>
        )}
      </div>
      <div className="post-content">
        <div className="post-meta">
          <Link to={`/author/${post.authorId}`} onClick={e => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--color-text-2)' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-2)'}
          >
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}>{initials}</span>
            {post.authorName}
          </Link>
          <span>•</span>
          <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>•</span>
          <span>{post.readTime} min</span>
        </div>
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">{(post.content || '').substring(0, 130)}…</p>
        <div className="post-footer">
          <div className="post-stats">
            <span className="post-stat"><Eye size={13} /> {post.viewCount || 0}</span>
            <span className="post-stat"><Heart size={13} /> {post.likeCount || 0}</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>Read more →</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [postsRes, trendingRes, catsRes, tagsRes] = await Promise.all([
          api.get('/posts'),
          api.get('/posts/trending'),
          api.get('/categories'),
          api.get('/tags/trending'),
        ]);
        setPosts(postsRes.data.content || []);
        setTrendingPosts(trendingRes.data || []);
        setCategories(catsRes.data || []);
        setTrendingTags(tagsRes.data || []);
      } catch {
        toast.error('Failed to load content. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setLoading(true);
      const res = await api.get('/posts');
      setPosts(res.data.content || []);
      setSelectedCategory(null); setSelectedTag(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/posts/search?query=${encodeURIComponent(searchQuery)}`);
      setPosts(res.data.content || []);
      setSelectedCategory(null); setSelectedTag(null);
    } catch { toast.error('Search failed.'); }
    finally { setLoading(false); }
  };

  const handleCategoryFilter = async (catId) => {
    setLoading(true);
    try {
      if (selectedCategory === catId) {
        const res = await api.get('/posts');
        setPosts(res.data.content || []);
        setSelectedCategory(null);
      } else {
        const res = await api.get(`/posts/category/${catId}`);
        setPosts(res.data.content || []);
        setSelectedCategory(catId);
        setSearchQuery('');
        setSelectedTag(null);
      }
    } catch { toast.error('Filter failed.'); }
    finally { setLoading(false); }
  };

  const handleTagFilter = async (tagSlug) => {
    setLoading(true);
    try {
      if (selectedTag === tagSlug) {
        const res = await api.get('/posts');
        setPosts(res.data.content || []); setSelectedTag(null);
      } else {
        const res = await api.get(`/posts/tag/${tagSlug}`);
        setPosts(res.data.content || []);
        setSelectedTag(tagSlug); setSelectedCategory(null); setSearchQuery('');
      }
    } catch { toast.error('Filter failed.'); }
    finally { setLoading(false); }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Check your email to confirm your subscription!', 'Subscribed 🎉');
      setEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      {/* ——— HERO ——— */}
      <section className="hero">
        <div className="container">
          <div className="animate-fade-in">
            <div className="hero-eyebrow">
              <Sparkles size={12} /> The modern home for ideas
            </div>
            <h1>Human stories<br />&amp; ideas.</h1>
            <p>A place to read, write, and deepen your understanding of the world.</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search stories, authors, topics…"
                style={{ paddingLeft: '3rem', paddingRight: '6.5rem', borderRadius: 'var(--radius-full)', border: 'none', boxShadow: 'var(--shadow-lg)', height: '52px', fontSize: '0.95rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', borderRadius: 'var(--radius-full)' }}>
                Search
              </button>
            </form>
            <button onClick={() => document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-secondary btn-pill"
              style={{ padding: '0.7rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Start reading <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ——— CATEGORY PILL STRIP ——— */}
      <div className="category-strip">
        <div className="container category-strip-inner">
          <button
            className={`tag${!selectedCategory && !selectedTag ? ' active' : ''}`}
            onClick={() => { setSelectedCategory(null); setSelectedTag(null); setSearchQuery(''); handleSearch(null); }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tag${selectedCategory === cat.id ? ' active' : ''}`}
              onClick={() => handleCategoryFilter(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ——— TRENDING ——— */}
      {!loading && trendingPosts.length > 0 && (
        <section style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-2)', padding: '3rem 0' }}>
          <div className="container">
            <div className="section-label">
              <TrendingUp size={14} /> Trending on InkWell
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {trendingPosts.slice(0, 6).map((post, i) => (
                <div key={post.id}
                  onClick={() => navigate(`/post/${post.slug}`)}
                  style={{ display: 'flex', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: 'var(--radius-md)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-3)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color: 'var(--color-border)', flexShrink: 0, width: '2rem', userSelect: 'none' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-3)' }}>
                      {post.authorName}
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
                      <span>{post.readTime} min read</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Heart size={11} />{post.likeCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— MAIN FEED + SIDEBAR ——— */}
      <div id="articles" className="container section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
        {/* Feed */}
        <div>
          <div className="section-title" style={{ marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name + ' Stories'
               : selectedTag ? `#${selectedTag}`
               : searchQuery ? `Results for "${searchQuery}"`
               : 'Latest Stories'}
            </h2>
          </div>

          {loading ? (
            <div className="post-grid">
              {[1,2,3,4].map(n => <SkeletonCard key={n} />)}
            </div>
          ) : posts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {posts.map((post, i) => (
                <div key={post.id}
                  style={{ display: 'grid', gridTemplateColumns: post.coverImageUrl ? '1fr 2fr' : '1fr', gap: '1.5rem', padding: '2rem 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate(`/post/${post.slug}`)}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--color-bg-2)'; e.currentTarget.style.paddingLeft = '0.75rem'; e.currentTarget.style.paddingRight = '0.75rem'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.paddingRight = '0'; }}
                  className="animate-fade-in"
                  style2={{ animationDelay: `${i * 0.05}s` }}
                >
                  {post.coverImageUrl && (
                    <img src={post.coverImageUrl} alt={post.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} loading="lazy" />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="post-meta" style={{ marginBottom: '0.5rem' }}>
                      <Link to={`/author/${post.authorId}`} onClick={e => e.stopPropagation()}
                        style={{ fontWeight: 600, color: 'var(--color-text-2)' }}
                        onMouseOver={e => e.target.style.color = 'var(--color-primary)'}
                        onMouseOut={e => e.target.style.color = 'var(--color-text-2)'}
                      >{post.authorName}</Link>
                      <span>•</span>
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem', lineHeight: 1.3, letterSpacing: '-0.02em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </h3>
                    <p style={{ color: 'var(--color-text-3)', fontSize: '0.92rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                      {(post.content || '').substring(0, 120)}…
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{post.readTime} min read</span>
                      <div className="post-stats">
                        <span className="post-stat" style={{ fontSize: '0.78rem' }}><Eye size={12} />{post.viewCount || 0}</span>
                        <span className="post-stat" style={{ fontSize: '0.78rem' }}><Heart size={12} />{post.likeCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={28} /></div>
              <h3 style={{ marginBottom: '0.5rem' }}>No stories found</h3>
              <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Be the first to write a story!'}
              </p>
            </div>
          )}
        </div>

        {/* ——— SIDEBAR ——— */}
        <aside>
          <div className="sidebar-sticky">
            {/* Newsletter */}
            <div id="newsletter" className="sidebar-card animate-fade-in" style={{ background: 'var(--color-bg-2)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>Never miss a story.</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-3)', lineHeight: 1.6 }}>
                  Get the best thinking delivered straight to your inbox.
                </p>
              </div>
              <form onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="form-input"
                  style={{ marginBottom: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary btn-full btn-pill" disabled={submitting}>
                  {submitting ? <><span className="spinner-sm" /> Subscribing…</> : 'Subscribe for free'}
                </button>
              </form>
            </div>

            {/* Trending Tags */}
            {trendingTags.length > 0 && (
              <div className="sidebar-card animate-fade-in" style={{ animationDelay: '0.1s', padding: '1.5rem' }}>
                <div className="section-label" style={{ marginBottom: '1rem' }}>Popular topics</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {trendingTags.map(tag => (
                    <button
                      key={tag.id}
                      className={`tag${selectedTag === tag.slug ? ' active' : ''}`}
                      onClick={() => handleTagFilter(tag.slug)}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
