import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Eye, Heart,Plus } from 'lucide-react';

export default function MyPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role === 'READER') {
      navigate('/');
      return;
    }

    const fetchMyPosts = async () => {
      try {
        const res = await api.get(`/posts/author/${user.id}`);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching stories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, [user, navigate]);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this story? This action cannot be undone.")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert("Failed to delete the story.");
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="container section animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>Your Stories</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Manage and track the performance of your articles.</p>
        </div>
        <Link to="/write" className="btn btn-primary" style={{ borderRadius: '2rem' }}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Write a story
        </Link>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'var(--color-secondary-bg)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>You haven't written any stories yet.</p>
          <Link to="/write" className="btn btn-outline">Start writing your first one</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '1.5rem' }}>Title</th>
                <th style={{ padding: '1.5rem' }}>Status</th>
                <th style={{ padding: '1.5rem' }}>Stats</th>
                <th style={{ padding: '1.5rem' }}>Published</th>
                <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1.5rem' }}>
                    <Link to={`/post/${post.slug}`} style={{ fontWeight: 600 }}>{post.title}</Link>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '1rem', 
                      backgroundColor: post.status === 'PUBLISHED' ? '#ecfdf5' : '#f3f4f6',
                      color: post.status === 'PUBLISHED' ? '#065f46' : '#374151'
                    }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Eye size={14}/> {post.viewCount}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Heart size={14}/> {post.likeCount}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link to={`/edit/${post.id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem' }}>
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(post.id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', color: '#dc2626' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
