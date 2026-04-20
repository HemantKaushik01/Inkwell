import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Eye, Heart } from 'lucide-react';

export default function Home() {
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
  const [subscribeMsg, setSubscribeMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, trendingRes, catsRes, tagsRes] = await Promise.all([
          api.get('/posts'),
          api.get('/posts/trending'),
          api.get('/categories'),
          api.get('/tags/trending')
        ]);
        setPosts(postsRes.data.content || []);
        setTrendingPosts(trendingRes.data || []);
        setCategories(catsRes.data || []);
        setTrendingTags(tagsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      // Reload all posts if search is cleared
      const res = await api.get('/posts');
      setPosts(res.data.content || []);
      setSelectedCategory(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/posts/search?query=${searchQuery}`);
      setPosts(res.data.content || []);
      setSelectedCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagFilter = async (tagSlug) => {
    setLoading(true);
    try {
      if (selectedTag === tagSlug) {
        const res = await api.get('/posts');
        setPosts(res.data.content || []);
        setSelectedTag(null);
      } else {
        const res = await api.get(`/posts/tag/${tagSlug}`);
        setPosts(res.data.content || []);
        setSelectedTag(tagSlug);
        setSelectedCategory(null);
        setSearchQuery('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      setSubscribeMsg('Thank you for subscribing! Please check your email to confirm.');
      setEmail('');
    } catch (err) {
      setSubscribeMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="hero animate-fade-in">
        <div className="container">
          <h1 className="animate-slide-in">Human stories & ideas.</h1>
          <p className="animate-fade-in">A place to read, write, and deepen your understanding.</p>
          <div className="flex justify-center gap-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search stories..." 
                style={{ borderRadius: '2rem', padding: '1rem 2rem', paddingRight: '4rem', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700' }}>Search</button>
            </form>
            <Link to="/login?mode=signup" className="btn btn-primary" style={{ borderRadius: '2rem', padding: '0.8rem 2.5rem' }}>Start reading</Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{ position: 'sticky', top: '70px', zIndex: 10, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--color-border)', padding: '0.8rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginRight: '0.5rem', whiteSpace: 'nowrap' }}>Discover:</span>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              style={{ 
                whiteSpace: 'nowrap', 
                padding: '0.4rem 1.2rem', 
                borderRadius: '2rem', 
                fontSize: '0.85rem',
                fontWeight: '500',
                backgroundColor: selectedCategory === cat.id ? 'var(--color-primary)' : 'transparent',
                color: selectedCategory === cat.id ? 'white' : 'var(--color-text-secondary)',
                border: '1px solid ' + (selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--color-border)'),
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { if(selectedCategory !== cat.id) e.target.style.borderColor = 'var(--color-text)'; }}
              onMouseOut={(e) => { if(selectedCategory !== cat.id) e.target.style.borderColor = 'var(--color-border)'; }}
            >
              {cat.name}
            </button>
          ))}
          <button 
            onClick={() => handleCategoryFilter(null)}
            style={{ 
              whiteSpace: 'nowrap', 
              padding: '0.4rem 1.2rem', 
              borderRadius: '2rem', 
              fontSize: '0.85rem',
              fontWeight: '500',
              backgroundColor: !selectedCategory ? 'var(--color-primary)' : 'transparent',
              color: !selectedCategory ? 'white' : 'var(--color-text-secondary)',
              border: '1px solid ' + (!selectedCategory ? 'var(--color-primary)' : 'var(--color-border)'),
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            All Categories
          </button>
        </div>
      </div>

      {/* Trending Section */}
      {!loading && trendingPosts.length > 0 && (
        <section className="container section" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.5rem', border: '1px solid var(--color-text)', borderRadius: '50%' }}>
              <Heart size={16} fill="currentColor" />
            </div>
            <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', margin: 0 }}>Trending on InkWell</h3>
          </div>
          <div className="post-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {trendingPosts.map((post, i) => (
              <Link to={`/post/${post.slug}`} key={post.id} style={{ display: 'flex', gap: '1.5rem', textDecoration: 'none' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-border)', flexShrink: 0 }}>0{i+1}</span>
                <div>
                  <div className="post-meta" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{post.authorName}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>{post.title}</h4>
                  <div className="post-meta">
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()} • {post.readTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="container section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
        <div>
          <div className="section-title">
            <h2>Latest Articles</h2>
          </div>
          
          {loading ? (
            <div className="loader"><div className="spinner"></div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {posts.length > 0 ? posts.map(post => (
                <Link to={`/post/${post.slug}`} key={post.id} style={{ display: 'grid', gridTemplateColumns: post.coverImageUrl ? '1fr 2fr' : '1fr', gap: '2rem', textDecoration: 'none' }}>
                  {post.coverImageUrl && (
                    <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  )}
                  <div>
                    <div className="post-meta">
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{post.authorName}</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="post-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{post.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineBreak: 'anywhere' }}>
                      {post.content.substring(0, 120)}...
                    </p>
                    <div className="post-footer">
                      <span className="text-sm text-secondary">{post.readTime} min read</span>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Eye size={14} />
                          <span>{post.viewCount || 0}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Heart size={14} />
                          <span>{post.likeCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <p>No posts available yet. Check back soon!</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div id="newsletter" className="card animate-fade-in" style={{ padding: '2rem', position: 'sticky', top: '100px', backgroundColor: '#f3f4f6', border: 'none' }}>
            <h3 style={{ marginBottom: '1rem' }}>Never miss a story.</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Sign up for our newsletter to get the latest thinking and stories delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="form-input" 
                style={{ marginBottom: '1rem', border: 'none' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', borderRadius: '2rem' }}
                disabled={submitting}
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {subscribeMsg && <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>{subscribeMsg}</p>}
          </div>

          {/* Trending Tags Section */}
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Discover more of what matters to you</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {trendingTags.length > 0 ? trendingTags.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => handleTagFilter(tag.slug)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.85rem',
                    backgroundColor: selectedTag === tag.slug ? 'var(--color-text)' : 'var(--color-bg)',
                    color: selectedTag === tag.slug ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tag.name}
                </button>
              )) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>No tags found.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
