import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostForm from '../components/PostForm';

export default function EditPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/posts/${id}`).then(res => {
      const post = res.data;
      if (post.authorId !== user?.id && user?.role !== 'ADMIN') { navigate('/'); return; }
      setInitialData(post);
    }).catch(() => toast.error('Post not found.'))
    .finally(() => setLoading(false));
  }, [id, user]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/posts/${id}`, payload);
      toast.success('Story updated successfully!');
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update post.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!initialData) return <div className="container section" style={{ textAlign: 'center' }}><h2>Post not found</h2></div>;

  return (
    <div className="animate-fade-in">
      <PostForm
        initialData={initialData}
        onSubmit={handleUpdate}
        loading={submitting}
        btnText="Save Changes"
      />
    </div>
  );
}
