import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { LayoutDashboard, Image, Mail, Settings, FileText, Users, Eye, Heart, Trash2, Copy, Check, ToggleLeft, ToggleRight, Send } from 'lucide-react';

const NAV_TABS = [
  { id: 'analytics', label: 'Overview',  icon: <LayoutDashboard size={16} /> },
  { id: 'media',     label: 'Media',     icon: <Image size={16} /> },
  { id: 'newsletter',label: 'Newsletter',icon: <Mail size={16} /> },
  { id: 'settings',  label: 'Settings',  icon: <Settings size={16} /> },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moderationRequired, setModerationRequired] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    (async () => {
      try {
        const [statsRes, mediaRes, campaignsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/media'),
          api.get('/newsletter/campaigns').catch(() => ({ data: [] }))
        ]);
        setStats(statsRes.data);
        setMedia(mediaRes.data || []);
        setCampaigns((campaignsRes.data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        try {
          const modRes = await api.get('/admin/comments/moderation');
          setModerationRequired(modRes.data.moderationRequired);
        } catch {}
      } catch { toast.error('Failed to load admin data.'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await api.delete(`/media/${id}`);
      setMedia(m => m.filter(x => x.id !== id));
      toast.success('File deleted.');
    } catch { toast.error('Failed to delete file.'); }
  };

  const handleCopyUrl = (url, id) => {
    const full = url.startsWith('http') ? url : `http://localhost:8080${url}`;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('URL copied to clipboard!');
  };

  const toggleModeration = async () => {
    const next = !moderationRequired;
    try {
      await api.put('/admin/comments/moderation', { required: next });
      setModerationRequired(next);
      toast.success(`Comment moderation ${next ? 'enabled' : 'disabled'}.`);
    } catch { toast.error('Failed to update moderation settings.'); }
  };

  const sendNewsletter = async () => {
    if (!newsletterSubject || !newsletterContent) { toast.warning('Please fill in subject and content.'); return; }
    try {
      if (editingCampaignId) {
        await api.put(`/admin/newsletter/campaigns/${editingCampaignId}`, { subject: newsletterSubject, content: newsletterContent });
        toast.success('Newsletter updated successfully.');
        setCampaigns(c => c.map(x => x.id === editingCampaignId ? { ...x, subject: newsletterSubject, content: newsletterContent } : x));
      } else {
        await api.post('/admin/newsletter/broadcast', { subject: newsletterSubject, content: newsletterContent });
        toast.success('Newsletter dispatched to all subscribers!', 'Broadcast sent');
        // Refresh campaigns
        const res = await api.get('/newsletter/campaigns').catch(() => ({ data: [] }));
        setCampaigns((res.data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      setNewsletterSubject(''); setNewsletterContent(''); setEditingCampaignId(null);
    } catch { toast.error(editingCampaignId ? 'Failed to update newsletter.' : 'Failed to send newsletter.'); }
  };

  const handleEditCampaign = (c) => {
    setNewsletterSubject(c.subject);
    setNewsletterContent(c.content);
    setEditingCampaignId(c.id);
    document.querySelector('.admin-layout main').scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this newsletter?')) return;
    try {
      await api.delete(`/admin/newsletter/campaigns/${id}`);
      setCampaigns(c => c.filter(x => x.id !== id));
      toast.success('Newsletter deleted.');
      if (editingCampaignId === id) {
        setEditingCampaignId(null);
        setNewsletterSubject('');
        setNewsletterContent('');
      }
    } catch { toast.error('Failed to delete newsletter.'); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container">
      <div className="admin-layout">
        {/* ——— Sidebar ——— */}
        <aside className="admin-sidebar">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
              Administration
            </div>
            {NAV_TABS.map(tab => (
              <button key={tab.id} className={`admin-nav-item${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* ——— Main Content ——— */}
        <main>
          {/* ——— TOP TABS (mobile) ——— */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }} className="show-mobile-only">
            {NAV_TABS.map(tab => (
              <button key={tab.id}
                className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ——— Overview ——— */}
          {activeTab === 'analytics' && stats && (
            <div>
              <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Platform Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Total Posts',    value: stats.totalPosts,   icon: <FileText size={20} />, color: 'var(--color-primary)' },
                  { label: 'Active Authors', value: stats.totalAuthors, icon: <Users size={20} />,    color: 'var(--color-success)' },
                  { label: 'Total Followers',value: stats.totalFollows, icon: <Heart size={20} />,    color: 'var(--color-danger)'  },
                  { label: 'Total Views',    value: stats.totalViews || '—', icon: <Eye size={20} />, color: 'hsl(38,92%,50%)' },
                ].map(s => (
                  <div key={s.label} className="stat-card animate-fade-in">
                    <div className="stat-card-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                    <div className="stat-card-number">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                    <div className="stat-card-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ——— Media ——— */}
          {activeTab === 'media' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 800 }}>Media Assets</h2>
                <span className="badge badge-neutral">{media.length} files</span>
              </div>
              {media.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Image size={28} /></div>
                  <h3>No media uploaded yet</h3>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                  {media.map(item => (
                    <div key={item.id} className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ height: 110, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.fileType?.startsWith('image/')
                          ? <img src={`http://localhost:8080${item.url}`} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <FileText size={24} style={{ color: 'var(--color-text-3)' }} />
                        }
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-2)' }} title={item.filename}>
                        {item.filename}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => handleCopyUrl(item.url, item.id)}
                          className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} title="Copy URL">
                          {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <button onClick={() => handleDeleteMedia(item.id)}
                          className="btn btn-sm btn-icon" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-subtle)' }} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ——— Newsletter ——— */}
          {activeTab === 'newsletter' && (
            <div>
              <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>{editingCampaignId ? 'Edit Newsletter' : 'Broadcast Newsletter'}</h2>
              <div className="card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {editingCampaignId ? 'Update this past broadcast content.' : 'Send an email update to all confirmed subscribers.'}
                </p>
                <div className="form-group">
                  <label className="form-label">Subject Line</label>
                  <input type="text" className="form-input" placeholder="e.g., This week's best stories"
                    value={newsletterSubject} onChange={e => setNewsletterSubject(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">HTML / Markdown Content</label>
                  <textarea className="form-input" rows={8} placeholder="Enter your email content here…"
                    value={newsletterContent} onChange={e => setNewsletterContent(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary btn-pill" onClick={sendNewsletter}
                    disabled={!newsletterSubject || !newsletterContent}>
                    <Send size={16} /> {editingCampaignId ? 'Update Newsletter' : 'Send Broadcast'}
                  </button>
                  {editingCampaignId && (
                    <button className="btn btn-secondary btn-pill" onClick={() => {
                      setEditingCampaignId(null);
                      setNewsletterSubject('');
                      setNewsletterContent('');
                    }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Past Broadcasts</h3>
              {campaigns.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <p style={{ color: 'var(--color-text-3)' }}>No newsletters have been broadcasted yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
                  {campaigns.map(c => (
                    <div key={c.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>{c.subject}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-3)' }}>
                          Sent on {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditCampaign(c)}>Edit</button>
                        <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteCampaign(c.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ——— Settings ——— */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Platform Settings</h2>
              <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.4rem', fontWeight: 700 }}>Require Comment Moderation</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-3)', lineHeight: 1.6 }}>
                      When enabled, all new comments default to <strong>PENDING</strong> status and require manual approval before appearing publicly.
                    </p>
                  </div>
                  <button onClick={toggleModeration}
                    style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: moderationRequired ? 'var(--color-primary)' : 'var(--color-text-3)', transition: 'color 0.2s' }}
                    title={moderationRequired ? 'Click to disable' : 'Click to enable'}
                    aria-label="Toggle comment moderation"
                  >
                    {moderationRequired
                      ? <ToggleRight size={36} />
                      : <ToggleLeft size={36} />
                    }
                  </button>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-3)', padding: '0 0.25rem' }}>
                  Status: <strong style={{ color: moderationRequired ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {moderationRequired ? 'Moderation ON' : 'Auto-approve ON'}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
