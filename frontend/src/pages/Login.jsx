import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Mail, Lock, User, Feather, ArrowRight } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';
  const [isLoginMode, setIsLoginMode] = useState(!isSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('READER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    setError('');
  }, [isLoginMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
        toast.success('Welcome back!', 'Signed in');
      } else {
        await register(username, fullName, email, password, role);
        toast.success(`Welcome to InkWell, ${fullName || username}!`, 'Account created');
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { id: 'READER', label: 'Reader', icon: '📖', desc: 'Read and discover stories' },
    { id: 'AUTHOR', label: 'Author', icon: '✍️', desc: 'Write and publish stories' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* ——— Brand Panel ——— */}
      <div style={{
        background: 'var(--gradient-brand)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 3rem',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="hide-mobile"
      >
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-mesh)', opacity: 0.15, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', textAlign: 'center', color: 'white', maxWidth: '380px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.06em', marginBottom: '1rem', textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            InkWell.
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1rem', color: 'white', opacity: 0.95 }}>
            {isLoginMode ? 'Welcome back, storyteller.' : 'Join the conversation.'}
          </h2>
          <p style={{ opacity: 0.8, fontSize: '1rem', lineHeight: 1.7 }}>
            {isLoginMode
              ? 'Your stories and ideas are waiting. Sign in to continue your journey.'
              : 'Become part of a community of curious readers and inspiring writers.'}
          </p>
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['📖 Stories', '✍️ Writers', '💡 Ideas', '🌍 Community'].map(chip => (
              <span key={chip} style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                {chip}
              </span>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* ——— Form Panel ——— */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: 'var(--color-bg)' }}>
        <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in">
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
              {isLoginMode ? 'Sign in' : 'Create account'}
            </h1>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>
              {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setIsLoginMode(!isLoginMode)}
                style={{ color: 'var(--color-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
                {isLoginMode ? 'Sign up →' : 'Sign in →'}
              </button>
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLoginMode && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label"><User size={14} /> Full Name</label>
                  <input type="text" className="form-input" value={fullName}
                    onChange={e => setFullName(e.target.value)} required
                    placeholder="Jane Smith" autoFocus={!isLoginMode} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label"><Feather size={14} /> Username</label>
                  <input type="text" className="form-input" value={username}
                    onChange={e => setUsername(e.target.value)} required
                    placeholder="janesmith" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">I want to…</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)}
                        style={{
                          padding: '0.875rem',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${role === r.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: role === r.id ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                        }}>
                        <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{r.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: role === r.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{r.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', marginTop: '0.1rem' }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label"><Mail size={14} /> Email Address</label>
              <input type="email" className="form-input" value={email}
                onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" autoFocus={isLoginMode} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label"><Lock size={14} /> Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder={isLoginMode ? '••••••••' : 'Min. 8 characters'}
                  style={{ paddingRight: '3rem' }}
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-pill" style={{ marginTop: '0.5rem', height: '48px', fontSize: '0.95rem' }} disabled={loading}>
              {loading ? (
                <><span className="spinner-sm" /> {isLoginMode ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                <>{isLoginMode ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
