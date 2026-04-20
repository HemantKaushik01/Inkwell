import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/write" element={<CreatePost />} />
            <Route path="/my-stories" element={<MyPosts />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/author/:id" element={<AuthorProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
