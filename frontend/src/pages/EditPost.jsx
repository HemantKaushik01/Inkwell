import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/PostForm';

export default function EditPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        const post = res.data;
        
        // Ownership check
        if (post.authorId !== user?.id && user?.role !== 'ADMIN') {
          navigate('/');
          return;
        }
        
        setInitialData(post);
      } catch (err) {
        console.error(err);
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPost();
  }, [id, user, navigate]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.put(`/posts/${id}`, payload);
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (error && !initialData) return <div className="container section">{error}</div>;

  return (
    <div className="container section animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '1rem' }}>Edit your story</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Refine your words and polish your ideas.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <PostForm 
          initialData={initialData} 
          onSubmit={handleUpdate} 
          loading={submitting} 
          btnText="Update Story" 
        />
      </div>
    </div>
  );
}
