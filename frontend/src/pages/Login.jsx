import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';
  
  const [isLoginMode, setIsLoginMode] = useState(!isSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('READER'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(username, fullName, email, password, role);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', margin: '4rem auto' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isLoginMode ? 'Welcome Back' : 'Join InkWell'}
        </h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">I am a...</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button"
                    className={`btn btn-sm ${role === 'READER' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, borderRadius: '2rem' }}
                    onClick={() => setRole('READER')}
                  >Reader</button>
                  <button 
                    type="button"
                    className={`btn btn-sm ${role === 'AUTHOR' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, borderRadius: '2rem' }}
                    onClick={() => setRole('AUTHOR')}
                  >Writer</button>
                  <button 
                    type="button"
                    className={`btn btn-sm ${role === 'ADMIN' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, borderRadius: '2rem' }}
                    onClick={() => setRole('ADMIN')}
                  >Admin</button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                  {role === 'READER' && "Read and comment on your favorite stories."}
                  {role === 'AUTHOR' && "Write and publish your own stories to the world."}
                  {role === 'ADMIN' && "Manage the platform and its users."}
                </p>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            style={{ color: 'var(--color-text)', fontWeight: '600', textDecoration: 'underline' }}
          >
            {isLoginMode ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
