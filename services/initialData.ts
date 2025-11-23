
import { User, Post, Message } from '../types';

// Simple hash function matching the one in Login/SignUp
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export const getInitialUsers = (): User[] => {
  return [
    {
      id: 'user_admin_crax',
      username: 'crax',
      email: 'crax@gmail.com',
      passwordHash: simpleHash('Pcmg1234!'),
      avatar: 'https://ui-avatars.com/api/?name=Crax&background=dc2626&color=fff&bold=true',
      following: [],
      followers: [],
      favorites: [],
      role: 'admin',
    }
  ];
};

export const getInitialPosts = (): Post[] => {
    return [];
};

export const getInitialMessages = (): Message[] => {
    return [];
};
