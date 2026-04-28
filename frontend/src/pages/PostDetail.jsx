import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, UserCheck, Heart, Eye, Edit, Trash2, ThumbsUp, Check, X, Share2, Bookmark, MessageSquare, ArrowLeft } from 'lucide-react';
import ReadingProgress from '../components/ReadingProgress';
import { SkeletonArticle } from '../components/SkeletonCard';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const postRes = await api.get(`/posts/slug/${slug}`);
        const p = postRes.data;
        setPost(p);
        api.post(`/posts/${p.id}/views`).catch(() => {});
        const commentsRes = await api.get(`/comments/post/${p.id}`);
        setComments(commentsRes.data.content || []);
        if (user) {
          try {
            const followingRes = await api.get(`/users/${user.id}/following`);
            const ids = followingRes.data.map(u => u.id);
            setIsFollowing(ids.includes(p.authorId));
          } catch {}
          // Check liked status from the server (global, persisted)
          try {
            const likedRes = await api.get(`/posts/${p.id}/liked`);
            setLiked(!!likedRes.data);
          } catch {
            setLiked(false);
          }
          const bookmarkKey = `bookmark_${p.id}_${user?.id}`;
          setBookmarked(!!localStorage.getItem(bookmarkKey));
        }
      } catch {
        toast.error('Failed to load post.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) { toast.info('Sign in to like posts.'); return; }
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setPost(prev => ({ ...prev, likeCount: (prev.likeCount || 0) + (wasLiked ? -1 : 1) }));
    try {
      const res = await api.post(`/posts/${post.id}/likes`);
      // Use server's authoritative values
      if (res.data?.likeCount !== undefined) {
        setPost(prev => ({ ...prev, likeCount: res.data.likeCount }));
      }
      if (res.data?.likedByCurrentUser !== undefined) {
        setLiked(res.data.likedByCurrentUser);
      }
    } catch {
      // Revert optimistic update on error
      setLiked(wasLiked);
      setPost(prev => ({ ...prev, likeCount: (prev.likeCount || 0) + (wasLiked ? 1 : -1) }));
      toast.error('Failed to update like.');
    }
  };

  const handleBookmark = () => {
    const key = `bookmark_${post?.id}_${user?.id}`;
    const next = !bookmarked;
    setBookmarked(next);
    if (next) { localStorage.setItem(key, '1'); toast.success('Story saved to your bookmarks.', 'Bookmarked'); }
    else { localStorage.removeItem(key); toast.info('Removed from bookmarks.', 'Bookmark removed'); }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: post.title, url }); }
    else { navigator.clipboard.writeText(url); toast.success('Link copied to clipboard.', 'Link copied!'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story permanently?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      toast.success('Story deleted.');
      navigate('/my-stories');
    } catch { toast.error('Failed to delete story.'); }
  };

  const handleFollowToggle = async () => {
    if (!user) { toast.info('Sign in to follow authors.'); return; }
    try {
      if (isFollowing) {
        await api.delete(`/users/${post.authorId}/follow`);
        setIsFollowing(false);
        toast.info(`Unfollowed ${post.authorName}`);
      } else {
        await api.post(`/users/${post.authorId}/follow`);
        setIsFollowing(true);
        toast.success(`Now following ${post.authorName}`, 'Following!');
      }
    } catch { toast.error('Failed to update follow status.'); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/comments?postId=${post.id}`, { content: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
      toast.success('Your comment is pending approval.', 'Comment submitted!');
    } catch { toast.error('Failed to submit comment.'); }
  };

  if (loading) return (
    <div className="container">
      <ReadingProgress />
      <SkeletonArticle />
    </div>
  );
  if (!post) return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <h2>Post not found</h2>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const authorInitials = (post.authorName || '?').slice(0, 2).toUpperCase();

  return (
    <article style={{ paddingBottom: '6rem' }}>
      <ReadingProgress />

      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mt-6 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '-0.5rem' }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Article header */}
        <header className="article-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          {post.categoryName && (
            <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              {post.categoryName}
            </span>
          )}
          <h1 className="article-title" style={{ textAlign: 'left' }}>{post.title}</h1>

          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to={`/author/${post.authorId}`}>
                <div className="author-avatar avatar-md" style={{ border: '2px solid var(--color-border)' }}>
                  {authorInitials}
                </div>
              </Link>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to={`/author/${post.authorId}`} style={{ fontWeight: 700, fontSize: '0.95rem' }}
                    onMouseOver={e => e.target.style.color = 'var(--color-primary)'}
                    onMouseOut={e => e.target.style.color = 'var(--color-text)'}
                  >{post.authorName}</Link>
                  {user && post.authorId !== user.id && (
                    <button onClick={handleFollowToggle}
                      className={`btn btn-sm btn-pill ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '0.2rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      {isFollowing ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--color-text-3)', marginTop: '0.2rem' }}>
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>·</span>
                  <span>{post.readTime} min read</span>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Eye size={13} /> {post.viewCount || 0}</span>
                </div>
              </div>
            </div>
            {(user?.id === post.authorId || user?.role === 'ADMIN') && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => navigate(`/edit/${post.id}`)} className="btn btn-secondary btn-sm" title="Edit">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={handleDelete} className="btn btn-danger btn-sm" title="Delete">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Inline like/share bar below header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={handleLike}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: liked ? 'var(--color-danger)' : undefined }}
            >
              <Heart size={16} fill={liked ? 'var(--color-danger)' : 'none'} stroke={liked ? 'var(--color-danger)' : 'currentColor'} />
              {post.likeCount || 0}
            </button>
            <button onClick={handleShare} className="btn btn-ghost btn-sm">
              <Share2 size={15} /> Share
            </button>
            {user && (
              <button onClick={handleBookmark} className="btn btn-ghost btn-sm"
                style={{ color: bookmarked ? 'var(--color-primary)' : undefined }}
              >
                <Bookmark size={15} fill={bookmarked ? 'var(--color-primary)' : 'none'} stroke={bookmarked ? 'var(--color-primary)' : 'currentColor'} />
                {bookmarked ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <img src={post.coverImageUrl} alt={post.title} className="article-cover" />
        )}

        {/* Content */}
        <div className="article-content" style={{ maxWidth: '100%' }}
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {post.tags.map((tag, i) => (
              <span key={i} className="tag" onClick={() => navigate(`/?tag=${tag}`)}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="divider divider-gradient" style={{ margin: '4rem 0' }} />

        {/* Author Bio */}
        <div className="author-card" style={{ marginBottom: '4rem' }}>
          <Link to={`/author/${post.authorId}`}>
            <div className="author-avatar" style={{ width: 64, height: 64, fontSize: '1.2rem', border: '3px solid var(--color-border)', flexShrink: 0 }}>
              {authorInitials}
            </div>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
              <Link to={`/author/${post.authorId}`} style={{ fontWeight: 800, fontSize: '1rem' }}>{post.authorName}</Link>
              {user && post.authorId !== user.id && (
                <button onClick={handleFollowToggle}
                  className={`btn btn-sm btn-pill ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Following' : '+ Follow'}
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-3)', margin: 0 }}>
              Written by {post.authorName} · {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Comments */}
        <div id="comments" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} /> Responses ({comments.filter(c => c.status === 'APPROVED').length})
          </h2>

          {user ? (
            <form onSubmit={submitComment} style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="author-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0, marginTop: '0.1rem' }}>
                  {(user.fullName || user.username || '?').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="What are your thoughts?"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{ resize: 'vertical', borderRadius: 'var(--radius-md)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm btn-pill" disabled={!newComment.trim()}>
                      Post Response
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ padding: '1.5rem', border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem' }}>
              <p style={{ color: 'var(--color-text-3)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Join the conversation</p>
              <Link to="/login" className="btn btn-primary btn-sm btn-pill">Sign in to respond</Link>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {comments.filter(c => !c.parentCommentId).map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                postAuthorId={post.authorId}
                user={user}
                toast={toast}
                onCommentAdded={newReply => {
                  const update = list => list.map(c => {
                    if (c.id === newReply.parentCommentId) return { ...c, replies: [newReply, ...(c.replies || [])] };
                    if (c.replies) return { ...c, replies: update(c.replies) };
                    return c;
                  });
                  setComments(update(comments));
                }}
                onCommentUpdated={updated => {
                  const update = list => list.map(c => {
                    if (c.id === updated.id) return { ...c, ...updated };
                    if (c.replies) return { ...c, replies: update(c.replies) };
                    return c;
                  });
                  setComments(update(comments));
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fab-bar">
        <button onClick={handleLike} className={`fab-btn${liked ? ' liked' : ''}`}>
          <Heart size={16} fill={liked ? 'var(--color-danger)' : 'none'} stroke={liked ? 'var(--color-danger)' : 'currentColor'} />
          {post.likeCount || 0}
        </button>
        <div className="fab-divider" />
        <button onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })} className="fab-btn">
          <MessageSquare size={16} /> {comments.filter(c => c.status === 'APPROVED').length}
        </button>
        <div className="fab-divider" />
        <button onClick={handleShare} className="fab-btn">
          <Share2 size={16} />
        </button>
        {user && (
          <>
            <div className="fab-divider" />
            <button onClick={handleBookmark} className="fab-btn" style={{ color: bookmarked ? 'var(--color-primary)' : undefined }}>
              <Bookmark size={16} fill={bookmarked ? 'var(--color-primary)' : 'none'} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function CommentItem({ comment, postId, postAuthorId, user, toast, onCommentAdded, onCommentUpdated, depth = 0 }) {
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
      setReplyContent(''); setIsReplying(false);
      toast?.success('Reply posted! Awaiting approval.', 'Reply submitted');
    } catch { toast?.error('Failed to post reply.'); }
    finally { setLoading(false); }
  };

  const handleLike = async () => {
    try {
      const res = await api.put(`/comments/${comment.id}/like`);
      onCommentUpdated(res.data);
    } catch {}
  };

  const handleStatusUpdate = async (status) => {
    try {
      let res;
      if (status === 'APPROVED') res = await api.put(`/comments/${comment.id}/approve`);
      else if (status === 'REJECTED') res = await api.put(`/comments/${comment.id}/reject`);
      onCommentUpdated(res.data);
      toast?.success(`Comment ${status.toLowerCase()}.`);
    } catch { toast?.error('Failed to update comment.'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${comment.id}`);
      onCommentUpdated({ ...comment, status: 'DELETED' });
    } catch { toast?.error('Failed to delete comment.'); }
  };

  if (comment.status === 'DELETED') {
    return (
      <div className="comment-item" style={{ borderLeft: depth > 0 ? '2px solid var(--color-border)' : 'none', paddingLeft: depth > 0 ? '1.5rem' : '0', opacity: 0.5 }}>
        <p style={{ fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--color-text-3)' }}>This comment was deleted.</p>
        {comment.replies?.length > 0 && (
          <div className="comment-nested">
            {comment.replies.map(r => <CommentItem key={r.id} comment={r} postId={postId} postAuthorId={postAuthorId} user={user} toast={toast} onCommentAdded={onCommentAdded} onCommentUpdated={onCommentUpdated} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  }

  const isVisible = comment.status === 'APPROVED' || canModerate || isCommentOwner;
  if (!isVisible) return null;

  const initials = (comment.userName || '?').slice(0, 2).toUpperCase();

  return (
    <div className="comment-item" style={{ borderLeft: depth > 0 ? '2px solid var(--color-border)' : 'none', paddingLeft: depth > 0 ? '1.5rem' : '0' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div className="comment-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{comment.userName}</span>
            {comment.status === 'PENDING' && <span className="badge badge-warning">Pending</span>}
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {canModerate && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                {comment.status !== 'APPROVED' && (
                  <button onClick={() => handleStatusUpdate('APPROVED')} className="btn btn-sm" style={{ padding: '0.2rem 0.4rem', color: 'var(--color-success)', background: 'var(--color-success-subtle)', borderRadius: 'var(--radius-xs)' }} title="Approve"><Check size={13} /></button>
                )}
                {comment.status !== 'REJECTED' && (
                  <button onClick={() => handleStatusUpdate('REJECTED')} className="btn btn-sm" style={{ padding: '0.2rem 0.4rem', color: 'var(--color-danger)', background: 'var(--color-danger-subtle)', borderRadius: 'var(--radius-xs)' }} title="Reject"><X size={13} /></button>
                )}
                <button onClick={handleDelete} className="btn btn-sm" style={{ padding: '0.2rem 0.4rem', color: 'var(--color-text-3)', borderRadius: 'var(--radius-xs)' }} title="Delete"><Trash2 size={13} /></button>
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '0.6rem' }}>{comment.content}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-text-3)', transition: 'color 0.15s', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-3)'}
            >
              <ThumbsUp size={13} /> {comment.likesCount || 0}
            </button>
            {user && depth === 0 && comment.status === 'APPROVED' && (
              <button onClick={() => setIsReplying(!isReplying)} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-3)'}
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} style={{ marginTop: '1rem', marginLeft: '3rem' }}>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Write a reply…"
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            autoFocus
            style={{ borderRadius: 'var(--radius-md)', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsReplying(false)} className="btn btn-secondary btn-sm btn-pill">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm btn-pill" disabled={loading || !replyContent.trim()}>
              {loading ? <><span className="spinner-sm" /> Posting…</> : 'Reply'}
            </button>
          </div>
        </form>
      )}

      {comment.replies?.length > 0 && (
        <div className="comment-nested">
          {comment.replies.map(r => (
            <CommentItem key={r.id} comment={r} postId={postId} postAuthorId={postAuthorId} user={user} toast={toast} onCommentAdded={onCommentAdded} onCommentUpdated={onCommentUpdated} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
