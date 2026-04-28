import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import PostDetail from './pages/PostDetail';
import AdminPanel from './pages/AdminPanel';
import CreatePost from './pages/CreatePost';
import MyPosts from './pages/MyPosts';
import EditPost from './pages/EditPost';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AuthorProfile from './pages/AuthorProfile';
import UserProfiles from './pages/UserProfiles';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/login"          element={<Login />} />
              <Route path="/post/:slug"     element={<PostDetail />} />
              <Route path="/admin"          element={<AdminPanel />} />
              <Route path="/write"          element={<CreatePost />} />
              <Route path="/my-stories"     element={<MyPosts />} />
              <Route path="/edit/:id"       element={<EditPost />} />
              <Route path="/notifications"  element={<Notifications />} />
              <Route path="/profile"        element={<Profile />} />
              <Route path="/author/:id"     element={<AuthorProfile />} />
              <Route path="/user-profiles"  element={<UserProfiles />} />
            </Routes>
          </main>
          <footer style={{
            borderTop: '1px solid var(--color-border)',
            padding: '2rem 0',
            marginTop: 'auto',
            background: 'var(--color-bg-2)'
          }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>InkWell.</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-3)' }}>© {new Date().getFullYear()} InkWell. A place to read, write, and connect.</span>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-3)' }}>
                <a href="/" style={{ transition: 'color 0.15s' }} onMouseOver={e => e.target.style.color='var(--color-text)'} onMouseOut={e => e.target.style.color='var(--color-text-3)'}>Home</a>
                <a href="#newsletter" style={{ transition: 'color 0.15s' }} onMouseOver={e => e.target.style.color='var(--color-text)'} onMouseOut={e => e.target.style.color='var(--color-text-3)'}>Newsletter</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
