import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Eye, Heart, Calendar, Mail, MapPin } from 'lucide-react';

export default function AuthorProfile() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorRes, postsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/posts/author/${id}`)
        ]);
        setAuthor(authorRes.data);
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error("Error fetching author data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!author) return <div className="container section"><h2>Author not found</h2></div>;

  return (
    <div className="container section animate-fade-in">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Author Header */}
        <div className="card" style={{ padding: '3rem', marginBottom: '3rem', border: 'none', background: '#f9f9f9' }}>
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <img 
              src={author.avatarUrl || `https://ui-avatars.com/api/?name=${author.fullName}&background=random`} 
              alt={author.fullName} 
              style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: 'var(--shadow-lg)' }} 
            />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{author.fullName}</h1>
              <p style={{ color: 'var(--color-primary)', fontWeight: '600', marginBottom: '1rem' }}>@{author.username}</p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                {author.bio || "No bio available yet."}
              </p>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> Joined {new Date(author.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} /> {posts.reduce((acc, p) => acc + (p.viewCount || 0), 0).toLocaleString()} Total Views
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Author Posts */}
        <div className="section-title">
          <h2>Published Stories</h2>
          <p>{posts.length} stories published on InkWell</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {posts.length > 0 ? posts.map(post => (
            <Link to={`/post/${post.slug}`} key={post.id} style={{ display: 'grid', gridTemplateColumns: post.coverImageUrl ? '1fr 2fr' : '1fr', gap: '2rem', textDecoration: 'none' }}>
              {post.coverImageUrl && (
                <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="post-meta">
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{post.readTime} min read</span>
                </div>
                <h3 className="post-title" style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>{post.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineBreak: 'anywhere', marginBottom: '1rem' }}>
                  {post.content.substring(0, 150)}...
                </p>
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
            </Link>
          )) : (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>This author hasn't published any stories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
