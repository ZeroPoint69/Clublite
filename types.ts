
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'member' | 'admin';
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  timestamp: number;
  likes: string[]; // Array of userIds who liked
  commentCount: number;
}

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  NEW_POST = 'NEW_POST'
}

export interface Notification {
  id: string;
  userId: string; // The user who receives the notification
  actorId: string; // The user who performed the action
  actorName: string;
  actorAvatar: string;
  type: NotificationType;
  postId?: string;
  content?: string;
  isRead: boolean;
  timestamp: number;
}

export enum AppView {
  LOGIN = 'LOGIN',
  FEED = 'FEED',
}
