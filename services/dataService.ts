
import { supabase } from './supabaseClient';
import { Post, Comment, User, Notification, NotificationType } from '../types';

// --- Profiles / Members ---

export const getMembers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  
  return data.map(row => ({
    id: row.id,
    name: row.name,
    avatar: row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}`,
    role: row.role as 'member' | 'admin'
  }));
};

// --- Notifications ---

const mapNotification = (row: any): Notification => ({
  id: row.id,
  userId: row.user_id,
  actorId: row.actor_id,
  actorName: row.actor_name,
  actorAvatar: row.actor_avatar,
  type: row.type as NotificationType,
  postId: row.post_id,
  content: row.content,
  isRead: row.is_read,
  timestamp: row.timestamp || new Date(row.created_at).getTime()
});

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data.map(mapNotification);
};

export const createNotification = async (notification: Partial<Notification>): Promise<void> => {
  const dbNotification = {
    user_id: notification.userId,
    actor_id: notification.actorId,
    actor_name: notification.actorName,
    actor_avatar: notification.actorAvatar,
    type: notification.type,
    post_id: notification.postId,
    content: notification.content,
    is_read: false,
    timestamp: Date.now()
  };

  const { error } = await supabase.from('notifications').insert(dbNotification);
  if (error) console.error('Error creating notification:', error);
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
};

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
  if (error) {
    console.error('Error creating post:', error);
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  await supabase.from('comments').delete().eq('post_id', postId);
  await supabase.from('notifications').delete().eq('post_id', postId);
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) console.error('Error deleting post:', error);
};

export const likePost = async (postId: string, userId: string, actor: User): Promise<void> => {
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('*')
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

  if (!error && !isLiked && post.user_id !== userId) {
    await createNotification({
      userId: post.user_id,
      actorId: actor.id,
      actorName: actor.name,
      actorAvatar: actor.avatar,
      type: NotificationType.LIKE,
      postId: postId
    });
  }
};

// --- Comments ---

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
  return data.map(row => ({
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    content: row.content,
    timestamp: row.timestamp || new Date(row.created_at).getTime()
  }));
};

export const addComment = async (comment: Comment, actor: User): Promise<void> => {
  const dbComment = {
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
    const { data: post } = await supabase.from('posts').select('*').eq('id', comment.postId).single();
    if (post) {
      await supabase.from('posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', comment.postId);
      
      if (post.user_id !== actor.id) {
        await createNotification({
          userId: post.user_id,
          actorId: actor.id,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: NotificationType.COMMENT,
          postId: comment.postId,
          content: comment.content
        });
      }
    }
  }
};

export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (!error) {
     const { data: post } = await supabase.from('posts').select('comment_count').eq('id', postId).single();
     if (post) {
       await supabase.from('posts').update({ comment_count: Math.max(0, (post.comment_count || 0) - 1) }).eq('id', postId);
     }
  }
};

// --- Realtime Subscriptions ---

export const subscribeToFeed = (onUpdate: () => void) => {
  const channel = supabase
    .channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => onUpdate())
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const subscribeToNotifications = (userId: string, onUpdate: () => void) => {
  const channel = supabase
    .channel(`public:notifications:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => onUpdate())
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const subscribeToComments = (postId: string, onUpdate: () => void) => {
    const channel = supabase
    .channel(`public:comments:${postId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, () => onUpdate())
    .subscribe();
  return () => supabase.removeChannel(channel);
}
