export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
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

export enum AppView {
  LOGIN = 'LOGIN',
  FEED = 'FEED',
}
