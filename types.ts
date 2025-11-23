
export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id:string;
  userId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  caption: string;
  likes: string[];
  comments: Comment[];
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  following: string[];
  followers: string[];
  favorites: string[];
  role?: 'admin' | 'user';
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: 'NEW_POST';
  postId?: string;
  timestamp: string;
  read: boolean;
}
// FIX: Add Message interface for the new messaging feature.
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  read: boolean;
}
