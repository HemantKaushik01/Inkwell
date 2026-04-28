import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, FileText, Image as ImageIcon, Tag, Save, Eye, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function estimateReadTime(text) {
  const wpm = 200;
  return Math.max(1, Math.ceil(wordCount(text) / wpm));
}

export default function PostForm({ initialData = {}, onSubmit, loading, btnText = 'Publish Now' }) {
  const toast = useToast();
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData.coverImageUrl || '');
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '');
  const [tags, setTags] = useState(initialData.tags ? initialData.tags.join(', ') : '');
  const [status, setStatus] = useState(initialData.status || 'PUBLISHED');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [categories, setCategories] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const fileInput = useRef(null);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/tags/trending')])
      .then(([cats, tagsRes]) => { setCategories(cats.data); setTrendingTags(tagsRes.data); })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCoverImageUrl(res.data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setCoverImageUrl(res.data.url);
        toast.success('Image uploaded!');
      } catch { toast.error('Upload failed.'); }
      finally { setUploading(false); }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.warning('Please add a title.'); return; }
    if (!content.trim()) { toast.warning('Please add some content.'); return; }
    onSubmit({
      title,
      content,
      coverImageUrl,
      categoryId: categoryId ? parseInt(categoryId) : null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status,
    });
  };

  const addTag = (tagName) => {
    const current = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!current.includes(tagName)) setTags(tags ? `${tags}, ${tagName}` : tagName);
  };

  const wc = wordCount(content);
  const readMins = estimateReadTime(content);

  return (
    <form onSubmit={handleSubmit}>
      {/* ——— Toolbar ——— */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 50,
        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.75rem 0', marginBottom: '2rem',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button type="button" onClick={() => setStatus('DRAFT')}
              className={`btn btn-sm btn-pill ${status === 'DRAFT' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ border: status === 'DRAFT' ? '1.5px solid var(--color-border-strong)' : '' }}>
              <Save size={14} /> Draft
            </button>
            <button type="button" onClick={() => setStatus('PUBLISHED')}
              className={`btn btn-sm btn-pill ${status === 'PUBLISHED' ? 'btn-primary' : 'btn-ghost'}`}>
              <Send size={14} /> Publish
            </button>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-3)' }}>
              {wc} words · {readMins} min read
            </span>
            <button type="button" onClick={() => setPreview(v => !v)}
              className={`btn btn-sm btn-pill ${preview ? 'btn-primary' : 'btn-secondary'}`}>
              <Eye size={14} /> {preview ? 'Edit' : 'Preview'}
            </button>
            <button type="submit" className="btn btn-primary btn-sm btn-pill" disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Processing…</> : btnText}
            </button>
          </div>
        </div>
      </div>

      <div className="container--narrow">
        {preview ? (
          /* ——— Preview Mode ——— */
          <div className="card animate-scale-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              {title || <span style={{ color: 'var(--color-text-3)' }}>No title yet…</span>}
            </h2>
            {coverImageUrl && (
              <img src={coverImageUrl.startsWith('http') ? coverImageUrl : `http://localhost:8080${coverImageUrl}`}
                alt="Cover" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
            )}
            <div className="article-content" style={{ maxWidth: '100%' }}
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') || '<p style="color:var(--color-text-3)">No content yet…</p>' }}
            />
          </div>
        ) : (
          /* ——— Edit Mode ——— */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Title */}
            <div>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="Give your story a headline…"
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800,
                  fontFamily: 'var(--font-serif)', lineHeight: 1.2,
                  background: 'transparent', color: 'var(--color-text)',
                  letterSpacing: '-0.03em',
                  borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderBottomColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--color-border)'}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="form-label"><ImageIcon size={14} /> Cover Image</label>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                  border: `2px dashed ${coverImageUrl ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)', padding: coverImageUrl ? 0 : '2rem',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color 0.2s', overflow: 'hidden',
                }}
                onClick={() => !coverImageUrl && fileInput.current?.click()}
              >
                {coverImageUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={coverImageUrl.startsWith('http') ? coverImageUrl : `http://localhost:8080${coverImageUrl}`}
                      alt="Cover" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                    <button type="button" onClick={e => { e.stopPropagation(); setCoverImageUrl(''); }}
                      className="btn btn-sm" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 'var(--radius-full)' }}>
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={28} style={{ color: 'var(--color-text-3)', marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {uploading ? 'Uploading…' : 'Drag & drop an image, or click to upload'}
                    </p>
                    <input type="text" className="form-input" placeholder="Or paste an image URL…"
                      value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ maxWidth: '320px', margin: '0 auto', fontSize: '0.85rem' }} />
                  </>
                )}
              </div>
              <input ref={fileInput} type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*" />
            </div>

            {/* Category + Tags row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Category</label>
                <select className="form-input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">Select category…</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label"><Tag size={14} /> Tags (comma-separated)</label>
                <input type="text" className="form-input" placeholder="writing, tech, life"
                  value={tags} onChange={e => setTags(e.target.value)} />
              </div>
            </div>

            {/* Popular tags */}
            {trendingTags.length > 0 && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', marginBottom: '0.5rem', fontWeight: 600 }}>Popular tags:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {trendingTags.slice(0, 8).map(tag => (
                    <button key={tag.id} type="button" onClick={() => addTag(tag.name)} className="tag" style={{ fontSize: '0.75rem' }}>
                      + {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="form-label"><FileText size={14} /> Content</label>
              <textarea
                className="form-input"
                rows={20}
                placeholder="Tell your story… Use blank lines to separate paragraphs."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                style={{
                  fontSize: '1.05rem', lineHeight: 1.8, resize: 'vertical',
                  fontFamily: 'var(--font-serif)', minHeight: '400px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {wc} words · ~{readMins} min read
              </div>
            </div>
          </div>
        )}

        {/* Bottom submit area */}
        {!preview && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" onClick={() => setStatus('DRAFT')} className="btn btn-secondary btn-pill">
              <Save size={16} /> Save as Draft
            </button>
            <button type="submit" className="btn btn-primary btn-pill" style={{ padding: '0.75rem 2.5rem' }} disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Processing…</> : <><Send size={16} /> {btnText}</>}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
