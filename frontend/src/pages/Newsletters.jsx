import { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Newsletters() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/newsletter/campaigns');
        // sort by newest first
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCampaigns(sorted);
      } catch (err) {
        toast.error('Failed to load newsletters.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container section">
      <div className="section-title" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Newsletter Archive</h1>
        <p style={{ color: 'var(--color-text-3)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Browse our past broadcasts and updates. Never miss the best ideas on InkWell.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state" style={{ padding: '4rem 1rem' }}>
          <div className="empty-state-icon"><Mail size={32} /></div>
          <h2>No newsletters yet</h2>
          <p style={{ color: 'var(--color-text-3)' }}>When admins send broadcasts, they will appear here.</p>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {campaigns.map((c) => (
            <div key={c.id} className="card animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-3)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <Calendar size={14} />
                <span>{new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.3 }}>
                {c.subject}
              </h2>
              <div className="prose" style={{ color: 'var(--color-text-2)' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {c.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
