import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserCheck, Heart, Eye, Edit, Trash2, ThumbsUp, Check, X } from 'lucide-react';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postRes = await api.get(`/posts/slug/${slug}`);
        setPost(postRes.data);

        // Increment view count
        api.post(`/posts/${postRes.data.id}/views`).catch(err => console.error("Error incrementing views:", err));

        // Fetch comments
        const commentsRes = await api.get(`/comments/post/${postRes.data.id}`);
        setComments(commentsRes.data.content || []);

        // Follow check
        try {
          if (user) {
            const followingRes = await api.get(`/users/${user.id}/following`);
            const followingIds = followingRes.data.map(u => u.id);
            setIsFollowing(followingIds.includes(postRes.data.authorId));
          }
        } catch (e) {
          console.error("error fetching follow status", e);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) return alert("Please log in to like posts");
    try {
      await api.post(`/posts/${post.id}/likes`);
      setPost({ ...post, likeCount: (post.likeCount || 0) + 1 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this story permanently?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      navigate('/my-stories');
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return alert("Please log in to follow authors");
    try {
      if (isFollowing) {
        await api.delete(`/users/${post.authorId}/follow`);
        setIsFollowing(false);
      } else {
        await api.post(`/users/${post.authorId}/follow`);
        setIsFollowing(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/comments?postId=${post.id}`, { content: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
      alert("Comment submitted and pending approval!");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!post) return <div className="container section">Post not found.</div>;

  return (
    <article>
      <div className="container">
        <header className="article-header" style={{ marginTop: '4rem' }}>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta" style={{ marginTop: '2rem' }}>
            <div className="article-author">
              <div className="author-avatar"></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                   <Link to={`/author/${post.authorId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                     <strong style={{ fontSize: '1.1rem', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.textDecoration='underline'} onMouseOut={(e) => e.target.style.textDecoration='none'}>
                       {post.authorName}
                     </strong>
                   </Link>
                   {user && post.authorId !== user?.id && (
                     <button onClick={handleFollowToggle} className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '2rem' }}>
                       {isFollowing ? <><UserCheck size={14}/> Following</> : <><UserPlus size={14}/> Follow</>}
                     </button>
                   )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  <span>{post.readTime} min read</span>
                  <span>•</span>
                  <span>Published {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}>
                    <Eye size={16} />
                    <span>{post.viewCount || 0}</span>
                  </div>
                  <button 
                    onClick={handleLike} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.3rem', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--color-text-secondary)', 
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <Heart size={16} style={{ fill: 'none' }} />
                    <span>{post.likeCount || 0}</span>
                  </button>

                  {(user?.id === post.authorId || user?.role === 'ADMIN') && (
                    <div style={{ display: 'flex', gap: '0.8rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--color-border)' }}>
                      <button onClick={() => navigate(`/edit/${post.id}`)} className="text-secondary" title="Edit story">
                        <Edit size={16} />
                      </button>
                      <button onClick={handleDelete} className="text-secondary" style={{ color: '#dc2626' }} title="Delete story">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {post.coverImageUrl && (
          <img src={post.coverImageUrl} alt={post.title} className="article-cover" />
        )}

        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
        
        <hr style={{ margin: '4rem 0', borderColor: 'var(--color-border)' }} />
        
        <div className="comments-section" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
          <h3>Comments ({comments.length})</h3>
          
          {user ? (
            <form onSubmit={submitComment} style={{ marginTop: '2rem', marginBottom: '3rem' }}>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="What are your thoughts?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ resize: 'vertical' }}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>Respond</button>
              </div>
            </form>
          ) : (
            <div style={{ padding: '2rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', margin: '2rem 0' }}>
              <p style={{ marginBottom: '1rem' }}>Sign in to share your thoughts.</p>
            </div>
          )}

          <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {comments.filter(c => !c.parentCommentId).map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                postId={post.id} 
                postAuthorId={post.authorId}
                user={user} 
                onCommentAdded={(newReply) => {
                  const updateReplies = (list) => list.map(c => {
                    if (c.id === newReply.parentCommentId) {
                      return { ...c, replies: [newReply, ...(c.replies || [])] };
                    }
                    if (c.replies) return { ...c, replies: updateReplies(c.replies) };
                    return c;
                  });
                  setComments(updateReplies(comments));
                }}
                onCommentUpdated={(updatedComment) => {
                  const updateList = (list) => list.map(c => {
                    if (c.id === updatedComment.id) {
                      return { ...c, ...updatedComment };
                    }
                    if (c.replies) return { ...c, replies: updateList(c.replies) };
                    return c;
                  });
                  setComments(updateList(comments));
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function CommentItem({ comment, postId, postAuthorId, user, onCommentAdded, onCommentUpdated, depth = 0 }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthor = user?.id === postAuthorId;
  const isAdmin = user?.role === 'ADMIN';
  const isCommentOwner = user?.id === comment.userId;
  const canModerate = isAuthor || isAdmin;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/comments/${comment.id}/reply`, { content: replyContent });
      onCommentAdded(res.data);
      setReplyContent('');
      setIsReplying(false);
      alert("Reply posted! It will appear once approved.");
    } catch (e) {
      console.error(e);
      alert("Failed to reply");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.put(`/comments/${comment.id}/like`);
      onCommentUpdated(res.data);
    } catch (e) { console.error(e); }
  };

  const handleStatusUpdate = async (status) => {
    try {
      let res;
      if (status === 'APPROVED') res = await api.put(`/comments/${comment.id}/approve`);
      else if (status === 'REJECTED') res = await api.put(`/comments/${comment.id}/reject`);
      onCommentUpdated(res.data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comments/${comment.id}`);
      onCommentUpdated({ ...comment, status: 'DELETED' });
    } catch (e) { console.error(e); }
  };

  // If deleted, show placeholder
  if (comment.status === 'DELETED') {
    return (
      <div className="comment-item" style={{ borderLeft: depth > 0 ? '2px solid var(--color-border)' : 'none', paddingLeft: depth > 0 ? '1.5rem' : '0', marginBottom: '1rem', opacity: 0.6 }}>
        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>This comment was deleted.</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies" style={{ marginTop: '1rem' }}>
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                postId={postId} 
                postAuthorId={postAuthorId}
                user={user} 
                onCommentAdded={onCommentAdded} 
                onCommentUpdated={onCommentUpdated}
                depth={depth + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Filter: Normal users can only see APPROVED comments. Authors/Admins/Owners can see PENDING.
  const isVisible = comment.status === 'APPROVED' || canModerate || isCommentOwner;
  if (!isVisible) return null;

  return (
    <div className="comment-item" style={{ 
      borderLeft: depth > 0 ? '2px solid var(--color-border)' : 'none', 
      paddingLeft: depth > 0 ? '1.5rem' : '0',
      marginBottom: '1.5rem' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div className="author-avatar" style={{ width: '32px', height: '32px' }}></div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{comment.userName}</span>
            {comment.status === 'PENDING' && <span style={{ fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Pending Approval</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {canModerate && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {comment.status !== 'APPROVED' && (
              <button onClick={() => handleStatusUpdate('APPROVED')} className="text-secondary" title="Approve" style={{ color: '#059669' }}><Check size={16}/></button>
            )}
            {comment.status !== 'REJECTED' && (
              <button onClick={() => handleStatusUpdate('REJECTED')} className="text-secondary" title="Reject" style={{ color: '#dc2626' }}><X size={16}/></button>
            )}
            <button onClick={handleDelete} className="text-secondary" title="Delete"><Trash2 size={16}/></button>
          </div>
        )}
      </div>

      <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>{comment.content}</p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
        <button 
          onClick={handleLike}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          <ThumbsUp size={14} />
          <span>{comment.likesCount || 0}</span>
        </button>

        {user && depth === 0 && comment.status === 'APPROVED' && (
          <button 
            onClick={() => setIsReplying(!isReplying)} 
            style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '600', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Reply
          </button>
        )}
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
          <textarea 
            className="form-input" 
            rows="2" 
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            autoFocus
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsReplying(false)} className="btn btn-sm btn-outline">Cancel</button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={loading || !replyContent.trim()}>
              {loading ? '...' : 'Reply'}
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies" style={{ marginTop: '1rem' }}>
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId} 
              postAuthorId={postAuthorId}
              user={user} 
              onCommentAdded={onCommentAdded} 
              onCommentUpdated={onCommentUpdated}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
