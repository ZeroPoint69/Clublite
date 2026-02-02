import React, { useState, useEffect } from 'react';
import { User, Post, Comment } from '../types';
import { likePost, deletePost, addComment, getComments, deleteComment, subscribeToComments } from '../services/dataService';
import Avatar from './Avatar';
import { ThumbsUp, MessageCircle, Trash2, Send, Loader2 } from 'lucide-react';

interface PostItemProps {
  post: Post;
  currentUser: User;
}

const PostItem: React.FC<PostItemProps> = ({ post, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser.id));
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser.id));
  }, [post.likes, currentUser.id]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (showComments) {
      setLoadingComments(true);
      
      const fetchAndSubscribe = async () => {
          const data = await getComments(post.id);
          setComments(data);
          setLoadingComments(false);

          unsubscribe = subscribeToComments(post.id, async () => {
              const updated = await getComments(post.id);
              setComments(updated);
          });
      }

      fetchAndSubscribe();
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [showComments, post.id]);

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked); // Optimistic UI
    
    await likePost(post.id, currentUser.id);
  };

  const handleDeletePost = async () => {
    if (window.confirm('Delete this post?')) {
      await deletePost(post.id);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSendingComment(true);

    const comment: Comment = {
      // Use crypto.randomUUID() for DB compatibility
      id: crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-' + Date.now().toString(16).padStart(12, '0'),
      postId: post.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newComment.trim(),
      timestamp: Date.now()
    };

    await addComment(comment);
    setNewComment('');
    setSendingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Delete this comment?')) {
      await deleteComment(commentId, post.id);
    }
  };

  const canDeletePost = currentUser.role === 'admin' || currentUser.id === post.userId;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-surface shadow-sm mb-4 border-b border-gray-200 md:rounded-lg md:border">
      <div className="p-4 flex justify-between items-start">
        <div className="flex gap-3">
          <Avatar src={post.userAvatar} alt={post.userName} />
          <div>
            <h3 className="font-semibold text-text text-base leading-tight hover:underline cursor-pointer">
              {post.userName}
            </h3>
            <span className="text-xs text-text-secondary hover:underline cursor-pointer">
              {formatDate(post.timestamp)}
            </span>
          </div>
        </div>
        {canDeletePost && (
          <button 
            onClick={handleDeletePost}
            className="text-text-secondary hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="px-4 pb-2 text-text leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      {post.image && (
         <div className="mt-2">
            <img src={post.image} alt="Post content" className="w-full object-cover max-h-96" />
         </div>
      )}

      <div className="px-4 py-2 flex justify-between text-text-secondary text-sm border-b border-gray-100">
        <div className="flex items-center gap-1">
          {post.likes.length > 0 && (
             <span className="bg-primary p-1 rounded-full text-white inline-flex items-center justify-center w-4 h-4">
               <ThumbsUp size={10} fill="white" />
             </span>
          )}
          <span>{post.likes.length > 0 ? post.likes.length : ''}</span>
        </div>
        <div 
            className="hover:underline cursor-pointer"
            onClick={() => setShowComments(!showComments)}
        >
          {post.commentCount} comments
        </div>
      </div>

      <div className="px-2 py-1 flex justify-between items-center">
        <button 
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition-colors ${
            isLiked ? 'text-primary' : 'text-text-secondary hover:bg-gray-100'
          }`}
        >
          <ThumbsUp size={18} className={isLiked ? 'fill-primary' : ''} />
          Like
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm text-text-secondary hover:bg-gray-100 transition-colors"
        >
          <MessageCircle size={18} />
          Comment
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50/50">
          <div className="p-4 space-y-4">
            {loadingComments ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-text-secondary" size={20} />
                </div>
            ) : (
                comments.map(comment => (
                <div key={comment.id} className="flex gap-2 group">
                    <Avatar src={comment.userAvatar} alt={comment.userName} size="sm" />
                    <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                            <span className="font-semibold text-sm block text-text">{comment.userName}</span>
                            <span className="text-sm text-text">{comment.content}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-text-secondary ml-3 mt-1">
                            <span>{formatDate(comment.timestamp)}</span>
                            {(currentUser.role === 'admin' || currentUser.id === comment.userId) && (
                            <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="font-medium hover:text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                            )}
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
          
          <form onSubmit={handleSubmitComment} className="p-4 pt-2 flex gap-2 items-center">
             <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
             <div className="flex-1 relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    disabled={sendingComment}
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim() || sendingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:text-gray-400 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                    {sendingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostItem;