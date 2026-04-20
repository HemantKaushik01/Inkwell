import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/PostForm';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCreate = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/posts', payload);
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '1rem' }}>Draft your story</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Share your thinking, expertise, and voice with the world.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <PostForm onSubmit={handleCreate} loading={loading} />
      </div>
    </div>
  );
}
