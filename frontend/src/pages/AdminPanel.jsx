import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/analytics/dashboard');
        setStats(statsRes.data);
        
        const mediaRes = await api.get('/media');
        setMedia(mediaRes.data);
      } catch (err) {
        console.error('Error fetching admin data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [user, navigate]);

  const handleDeleteMedia = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.delete(`/media/${id}`);
      setMedia(media.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Admin Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', marginTop: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <button 
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('analytics')}
        >Overview</button>
        <button 
          className={`btn ${activeTab === 'media' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('media')}
        >Media Assets</button>
        <button 
          className={`btn ${activeTab === 'newsletter' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('newsletter')}
        >Newsletter</button>
      </div>

      {activeTab === 'analytics' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>Total Posts</h3>
            <p style={{ fontSize: '3rem', fontWeight: '800', margin: 0 }}>{stats.totalPosts}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>Active Authors</h3>
            <p style={{ fontSize: '3rem', fontWeight: '800', margin: 0 }}>{stats.totalAuthors}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>Total Followers</h3>
            <p style={{ fontSize: '3rem', fontWeight: '800', margin: 0 }}>{stats.totalFollows}</p>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div>
          <h3>Uploaded Assets ({media.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {media.map(item => (
              <div key={item.id} className="card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '100px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', overflow: 'hidden' }}>
                  {item.fileType?.startsWith('image/') ? (
                     <img src={`http://localhost:8080${item.url}`} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>File</div>}
                </div>
                <div style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.5rem' }}>
                  {item.filename}
                </div>
                <button 
                  onClick={() => handleDeleteMedia(item.id)}
                  style={{ backgroundColor: '#ffcccc', color: '#cc0000', border: 'none', padding: '0.3rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', marginTop: 'auto' }}
                >Delete</button>
              </div>
            ))}
            {media.length === 0 && <p>No media files found.</p>}
          </div>
        </div>
      )}

      {activeTab === 'newsletter' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3>Broadcast Email</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Send an update to all confirmed subscribers.</p>
          
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="form-input" placeholder="E.g., Weekly Roundup" />
          </div>
          
          <div className="form-group">
            <label className="form-label">HTML Content</label>
            <textarea className="form-input" rows={6} placeholder="Enter formatted email content..."></textarea>
          </div>
          
          <button className="btn btn-primary" onClick={() => alert('Dispatched to RabbitMQ (Mock)')}>Send Broadcast</button>
        </div>
      )}
    </div>
  );
}
