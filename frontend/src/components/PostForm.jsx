import { useState, useEffect } from 'react';
import api from '../api';
import { Send, FileText, Image as ImageIcon, Tag, Save } from 'lucide-react';

export default function PostForm({ initialData = {}, onSubmit, loading, btnText = "Publish Now" }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData.coverImageUrl || '');
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '');
  const [tags, setTags] = useState(initialData.tags ? initialData.tags.join(', ') : '');
  const [status, setStatus] = useState(initialData.status || 'PUBLISHED');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, tagsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/tags/trending')
        ]);
        setCategories(catsRes.data);
        setTrendingTags(tagsRes.data);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Note: In a production gateway setup, this might be /media/upload
      const res = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setCoverImageUrl(res.data.url);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title,
      content,
      coverImageUrl,
      categoryId: categoryId ? parseInt(categoryId) : null,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      status
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '3rem' }}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input 
          type="text" 
          className="form-input" 
          style={{ fontSize: '1.5rem', fontWeight: '700', border: 'none', borderBottom: '2px solid var(--color-border)', borderRadius: 0, paddingLeft: 0, paddingRight: 0 }}
          placeholder="Give your story a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="form-group">
          <label className="form-label flex items-center gap-2"><ImageIcon size={16}/> Cover Image</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="https://example.com/image.jpg or upload below"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                OR <label style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                  upload a file
                  <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*" />
                </label>
                {uploading && <span style={{ marginLeft: '1rem' }}>Uploading...</span>}
                {uploadError && <span style={{ marginLeft: '1rem', color: 'red' }}>{uploadError}</span>}
              </div>
            </div>
            {coverImageUrl && (
              <img 
                src={coverImageUrl.startsWith('http') ? coverImageUrl : `http://localhost:8080${coverImageUrl}`} 
                alt="Preview" 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label flex items-center gap-2" style={{ color: 'var(--color-primary)', fontWeight: '600' }}><Tag size={16}/> Choose a Category</label>
          <select 
            className="form-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ 
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2003/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.2em',
              paddingRight: '3rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="">Select a category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label flex items-center gap-2"><Tag size={16}/> Tags (comma separated)</label>
        <input 
          type="text" 
          className="form-input" 
          placeholder="writing, tech, life"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.8rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>Popular:</span>
          {trendingTags.slice(0, 5).map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                const currentTags = tags.split(',').map(t => t.trim()).filter(t => t !== '');
                if (!currentTags.includes(tag.name)) {
                  setTags(tags ? `${tags}, ${tag.name}` : tag.name);
                }
              }}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer' }}
            >
              + {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label flex items-center gap-2"><FileText size={16}/> Content</label>
        <textarea 
          className="form-input" 
          rows="12" 
          placeholder="Once upon a time..."
          style={{ fontSize: '1.1rem', lineHeight: '1.8', resize: 'vertical' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => setStatus('DRAFT')}
            className={`btn ${status === 'DRAFT' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '2rem' }}
          >
            <Save size={18} style={{ marginRight: '0.5rem' }} /> Save as Draft
          </button>
          <button 
            type="button" 
            onClick={() => setStatus('PUBLISHED')}
            className={`btn ${status === 'PUBLISHED' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '2rem' }}
          >
            <Send size={18} style={{ marginRight: '0.5rem' }} /> Ready to Publish
          </button>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ borderRadius: '2rem', padding: '0.75rem 3rem' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : btnText}
        </button>
      </div>
    </form>
  );
}
