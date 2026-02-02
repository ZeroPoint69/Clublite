
import React, { useState, useEffect, useRef } from 'react';
import { User, Post, Comment } from '../types';
import { likePost, deletePost, addComment, getComments, deleteComment, subscribeToComments } from '../services/dataService';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';
import { ThumbsUp, MessageCircle, Trash2, Send, Loader2, MoreHorizontal, ShieldCheck } from 'lucide-react';

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
  const [showMenu, setShowMenu] = useState(false);
  
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

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
    return () => { if (unsubscribe) unsubscribe(); };
  }, [showComments, post.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    await likePost(post.id, currentUser.id, currentUser);
  };

  const onConfirmDeletePost = async () => {
    setConfirmDeletePost(false);
    await deletePost(post.id);
  };

  const onConfirmDeleteComment = async () => {
    if (commentToDelete) {
      await deleteComment(commentToDelete, post.id);
      setCommentToDelete(null);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSendingComment(true);
    const comment: Comment = {
      id: crypto.randomUUID(),
      postId: post.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newComment.trim(),
      timestamp: Date.now()
    };
    await addComment(comment, currentUser);
    setNewComment('');
    setSendingComment(false);
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
    <div className="bg-white shadow-sm mb-4 border-b border-gray-200 md:rounded-lg md:border overflow-hidden">
      <div className="p-4 flex justify-between items-start">
        <div className="flex gap-3">
          <Avatar src={post.userAvatar} alt={post.userName} />
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-gray-900 text-base leading-tight hover:underline cursor-pointer">
                {post.userName}
              </h3>
              {post.userName.toLowerCase().includes('admin') && (
                <ShieldCheck size={14} className="text-primary fill-primary/10" />
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(post.timestamp)}
            </span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 hover:bg-gray-100 active:scale-90 p-2 rounded-full transition-all"
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
              {canDeletePost ? (
                <button 
                  onClick={() => { setShowMenu(false); setConfirmDeletePost(true); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-2 font-medium transition-colors"
                >
                  <Trash2 size={16} /> Delete Post
                </button>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-400 italic text-center">
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-2 text-gray-800 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      {post.image && (
         <div className="mt-2">
            <img src={post.image} alt="Post content" className="w-full object-cover max-h-96" />
         </div>
      )}

      <div className="px-4 py-2 flex justify-between text-gray-500 text-sm border-b border-gray-100">
        <div className="flex items-center gap-1">
          {post.likes.length > 0 && (
             <span className="bg-primary p-1 rounded-full text-white inline-flex items-center justify-center w-4 h-4">
               <ThumbsUp size={10} fill="white" />
             </span>
          )}
          <span>{post.likes.length > 0 ? post.likes.length : ''}</span>
        </div>
        <div 
            className="hover:underline cursor-pointer active:opacity-60 transition-opacity"
            onClick={() => setShowComments(!showComments)}
        >
          {post.commentCount} comments
        </div>
      </div>

      <div className="px-2 py-1 flex justify-between items-center">
        <button 
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition-all active:scale-95 ${
            isLiked ? 'text-primary' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ThumbsUp size={18} className={isLiked ? 'fill-primary' : ''} />
          Like
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
        >
          <MessageCircle size={18} />
          Comment
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4 space-y-4">
            {loadingComments ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                </div>
            ) : (
                comments.map(comment => (
                <div key={comment.id} className="flex gap-2 group">
                    <Avatar src={comment.userAvatar} alt={comment.userName} size="sm" />
                    <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-sm block text-gray-900">{comment.userName}</span>
                              {comment.userName.toLowerCase().includes('admin') && (
                                <ShieldCheck size={12} className="text-primary fill-primary/10" />
                              )}
                            </div>
                            <span className="text-sm text-gray-800">{comment.content}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400 ml-3 mt-1">
                            <span>{formatDate(comment.timestamp)}</span>
                            {(currentUser.role === 'admin' || currentUser.id === comment.userId) && (
                            <button 
                                onClick={() => setCommentToDelete(comment.id)}
                                className="font-medium hover:text-red-500 hover:underline active:opacity-50 transition-all"
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
                    className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2 text-[16px] focus:outline-none focus:ring-1 focus:ring-primary/50 text-gray-800"
                    disabled={sendingComment}
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim() || sendingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:text-gray-400 p-1 hover:bg-gray-200 active:scale-90 rounded-full transition-all"
                >
                    {sendingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
             </div>
          </form>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmDeletePost}
        title="Delete Post?"
        message="Are you sure you want to remove this post? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={onConfirmDeletePost}
        onCancel={() => setConfirmDeletePost(false)}
      />

      <ConfirmDialog 
        isOpen={!!commentToDelete}
        title="Delete Comment?"
        message="Do you really want to delete this comment?"
        confirmLabel="Delete"
        onConfirm={onConfirmDeleteComment}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
};

export default PostItem;
