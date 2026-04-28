import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostForm from '../components/PostForm';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCreate = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/posts', payload);
      toast.success('Your story has been published!', 'Published 🎉');
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PostForm onSubmit={handleCreate} loading={loading} btnText="Publish Story" />
    </div>
  );
}
