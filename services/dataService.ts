import { supabase } from './supabaseClient';
import { Post, Comment, User } from '../types';

// --- Posts ---

const mapPost = (row: any): Post => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userAvatar: row.user_avatar,
  content: row.content,
  image: row.image,
  timestamp: row.timestamp || new Date(row.created_at).getTime(),
  likes: row.likes || [],
  commentCount: row.comment_count || 0
});

export const getPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data.map(mapPost);
};

export const createPost = async (post: Post): Promise<void> => {
  const dbPost = {
    // If the post.id is a temporary client-generated string (like 'post-123'), 
    // we might want the DB to generate a proper UUID. 
    // However, if we generated a valid UUID on the client, we can use it.
    // For simplicity, we'll try to use the client ID if it looks like a UUID,
    // otherwise let Postgres generate one. 
    // But typically simpler: just pass id: post.id and ensure client generates UUID.
    id: post.id,
    user_id: post.userId,
    user_name: post.userName,
    user_avatar: post.userAvatar,
    content: post.content,
    image: post.image,
    timestamp: post.timestamp,
    likes: [],
    comment_count: 0
  };

  const { error } = await supabase.from('posts').insert(dbPost);
  if (error) console.error('Error creating post:', error);
};

export const deletePost = async (postId: string): Promise<void> => {
  // Manual cascade delete for comments if DB cascade not set
  await supabase.from('comments').delete().eq('post_id', postId);
  
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) console.error('Error deleting post:', error);
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .single();

  if (fetchError || !post) return;

  const currentLikes: string[] = post.likes || [];
  const isLiked = currentLikes.includes(userId);
  const newLikes = isLiked 
    ? currentLikes.filter(id => id !== userId)
    : [...currentLikes, userId];

  const { error } = await supabase
    .from('posts')
    .update({ likes: newLikes })
    .eq('id', postId);

  if (error) console.error('Error liking post:', error);
};

// --- Comments ---

const mapComment = (row: any): Comment => ({
  id: row.id,
  postId: row.post_id,
  userId: row.user_id,
  userName: row.user_name,
  userAvatar: row.user_avatar,
  content: row.content,
  timestamp: row.timestamp || new Date(row.created_at).getTime()
});

export const getComments = async (postId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data.map(mapComment);
};

export const addComment = async (comment: Comment): Promise<void> => {
  const dbComment = {
    // Same UUID logic as posts
    id: comment.id,
    post_id: comment.postId,
    user_id: comment.userId,
    user_name: comment.userName,
    user_avatar: comment.userAvatar,
    content: comment.content,
    timestamp: comment.timestamp
  };

  const { error } = await supabase.from('comments').insert(dbComment);
  
  if (!error) {
    const { data: post } = await supabase.from('posts').select('comment_count').eq('id', comment.postId).single();
    if (post) {
      await supabase.from('posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', comment.postId);
    }
  } else {
    console.error('Error adding comment:', error);
  }
};

export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  
  if (!error) {
     const { data: post } = await supabase.from('posts').select('comment_count').eq('id', postId).single();
     if (post) {
       await supabase.from('posts').update({ comment_count: Math.max(0, (post.comment_count || 0) - 1) }).eq('id', postId);
     }
  } else {
    console.error('Error deleting comment:', error);
  }
};

// --- Realtime Subscriptions ---

export const subscribeToFeed = (onUpdate: () => void) => {
  const channel = supabase
    .channel('public:posts')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToComments = (postId: string, onUpdate: () => void) => {
    const channel = supabase
    .channel(`public:comments:${postId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
