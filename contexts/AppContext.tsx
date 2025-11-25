import React, { createContext, useState, useEffect, useCallback } from 'react';
// FIX: Import the Message type for the new messaging feature.
import { User, Post, Comment, Notification, Message } from '../types';
// FIX: Import initial messages data.
import { getInitialUsers, getInitialPosts, getInitialMessages } from '../services/initialData';
import { playLikeSound, playFollowSound } from '../services/audioService';

// Helper to get data from localStorage
const getStorageItem = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// Helper to set data in localStorage
const setStorageItem = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key “${key}”:`, error);
  }
};


interface AppContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  notifications: Notification[];
  toast: { message: string, type: 'success' | 'error' } | null;
  searchQuery: string;
  login: (email: string, passwordHash: string) => boolean;
  logout: () => void;
  signup: (username: string, email: string, passwordHash: string) => boolean;
  createPost: (postData: Omit<Post, 'id' | 'userId' | 'likes' | 'comments' | 'timestamp'>) => void;
  toggleLike: (postId: string) => void;
  toggleFavorite: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleFollow: (userIdToFollow: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  setSearchQuery: (query: string) => void;
  updateUserProfile: (data: { username: string; email: string }) => boolean;
  updatePassword: (passwordHash: string) => boolean;
  markNotificationsAsRead: () => void;
  updateUserAvatar: (avatarDataUrl: string) => void;
  deletePost: (postId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  deleteUser: (userId: string) => void;
  // FIX: Add types for messaging feature.
  messages: Message[];
  sendMessage: (recipientId: string, text: string) => void;
  markMessagesAsRead: (senderId: string) => void;
}

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getStorageItem('users', getInitialUsers()));
  const [posts, setPosts] = useState<Post[]>(() => getStorageItem('posts', getInitialPosts()));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStorageItem('notifications', []));
  // FIX: Add state for messages.
  const [messages, setMessages] = useState<Message[]>(() => getStorageItem('messages', getInitialMessages()));
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStorageItem('currentUser', null));
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => setStorageItem('users', users), [users]);
  useEffect(() => setStorageItem('posts', posts), [posts]);
  useEffect(() => setStorageItem('currentUser', currentUser), [currentUser]);
  useEffect(() => setStorageItem('notifications', notifications), [notifications]);
  // FIX: Persist messages to localStorage.
  useEffect(() => setStorageItem('messages', messages), [messages]);


  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const login = (email: string, passwordHash: string): boolean => {
    const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
    if (user) {
      setCurrentUser(user);
      showToast('Login successful!', 'success');
      return true;
    }
    showToast('Invalid email or password.', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Logged out successfully.', 'success');
  };

  const signup = (username: string, email: string, passwordHash: string): boolean => {
    if (users.some(u => u.username === username || u.email === email)) {
      showToast('Username or email already exists.', 'error');
      return false;
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      email,
      passwordHash,
      avatar: `https://picsum.photos/seed/${username}/200`,
      following: [],
      followers: [],
      favorites: [],
      role: 'user',
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast('Account created successfully!', 'success');
    return true;
  };

  const createPost = (postData: Omit<Post, 'id' | 'userId' | 'likes' | 'comments' | 'timestamp'>) => {
    if (!currentUser) {
        showToast('You must be logged in to post.', 'error');
        return;
    }
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      likes: [],
      comments: [],
      timestamp: new Date().toISOString(),
    };
    setPosts(prev => [newPost, ...prev]);

    // Create notifications for followers
    const author = users.find(u => u.id === currentUser.id);
    if(author?.followers) {
        const newNotifications: Notification[] = author.followers.map(followerId => ({
            id: `notif_${Date.now()}_${followerId}`,
            recipientId: followerId,
            actorId: currentUser.id,
            type: 'NEW_POST',
            postId: newPost.id,
            timestamp: new Date().toISOString(),
            read: false,
        }));
        setNotifications(prev => [...prev, ...newNotifications]);
    }

    showToast('Post created successfully!', 'success');
  };

  const toggleLike = (postId: string) => {
    if (!currentUser) {
        showToast('You must be logged in to like posts.', 'error');
        return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(currentUser.id);
          if (!isLiked) {
            playLikeSound();
          }
          const newLikes = isLiked
            ? post.likes.filter(id => id !== currentUser.id)
            : [...post.likes, currentUser.id];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );
  };
  
  const toggleFavorite = (postId: string) => {
    if (!currentUser) {
      showToast('You must be logged in to favorite posts.', 'error');
      return;
    }
    setUsers(prevUsers => {
      const userIndex = prevUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) {
        return prevUsers;
      }

      const userToUpdate = prevUsers[userIndex];
      const isFavorited = userToUpdate.favorites.includes(postId);

      const updatedUser = {
        ...userToUpdate,
        favorites: isFavorited
          ? userToUpdate.favorites.filter(id => id !== postId)
          : [...userToUpdate.favorites, postId],
      };

      const newUsers = [...prevUsers];
      newUsers[userIndex] = updatedUser;

      setCurrentUser(updatedUser);
      return newUsers;
    });
  };

  const addComment = (postId: string, text: string) => {
    if (!currentUser) {
      showToast('You must be logged in to comment.', 'error');
      return;
    }
    const newComment: Comment = {
        id: `comment_${Date.now()}`,
        userId: currentUser.id,
        text,
        timestamp: new Date().toISOString(),
    };
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, comments: [...post.comments, newComment].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) } : post
      )
    );
  };

  const toggleFollow = useCallback((userIdToFollow: string) => {
    if (!currentUser) {
        showToast('You must be logged in to follow users.', 'error');
        return;
    }
    if (currentUser.id === userIdToFollow) return;

    setUsers(prevUsers => {
        const newUsers = [...prevUsers];
        const userIndex = newUsers.findIndex(u => u.id === currentUser.id);
        const targetUserIndex = newUsers.findIndex(u => u.id === userIdToFollow);

        if(userIndex === -1 || targetUserIndex === -1) return prevUsers;

        const isFollowing = newUsers[userIndex].following.includes(userIdToFollow);
        
        if (!isFollowing) {
            playFollowSound();
        }

        if(isFollowing) {
            newUsers[userIndex].following = newUsers[userIndex].following.filter(id => id !== userIdToFollow);
            newUsers[targetUserIndex].followers = newUsers[targetUserIndex].followers.filter(id => id !== currentUser.id);
        } else {
            newUsers[userIndex].following.push(userIdToFollow);
            newUsers[targetUserIndex].followers.push(currentUser.id);
        }
        
        setCurrentUser(newUsers[userIndex]);

        return newUsers;
    });

  }, [currentUser, showToast]);

  const updateUserProfile = (data: { username: string, email: string }) => {
    if (!currentUser) return false;

    // Check if new username or email is already taken by another user
    if (users.some(u => u.id !== currentUser.id && (u.username === data.username || u.email === data.email))) {
        showToast('Username or email is already taken.', 'error');
        return false;
    }

    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, ...data } : u);
    setUsers(updatedUsers);
    
    const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id)!;
    setCurrentUser(updatedCurrentUser);

    showToast('Profile updated successfully!', 'success');
    return true;
  };

  const updatePassword = (passwordHash: string) => {
     if (!currentUser) return false;

     const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, passwordHash } : u);
     setUsers(updatedUsers);
     
     const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id)!;
     setCurrentUser(updatedCurrentUser);
 
     showToast('Password updated successfully!', 'success');
     return true;
  };
  
  const updateUserAvatar = (avatarDataUrl: string) => {
    if (!currentUser) return;

    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, avatar: avatarDataUrl } : u);
    setUsers(updatedUsers);
    
    const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id)!;
    setCurrentUser(updatedCurrentUser);
  };

  const markNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => 
        prev.map(n => 
            n.recipientId === currentUser.id ? { ...n, read: true } : n
        )
    );
  };
  
  const deletePost = (postId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('You do not have permission to delete posts.', 'error');
      return;
    }
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast('Post deleted successfully.', 'success');
  };

  const deleteComment = (postId: string, commentId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('You do not have permission to delete comments.', 'error');
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: post.comments.filter(c => c.id !== commentId) };
        }
        return post;
      })
    );
    showToast('Comment deleted successfully.', 'success');
  };

  const deleteUser = (userId: string) => {
    if (!currentUser) return;

    // Allow if admin or if deleting self
    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      showToast('You do not have permission to delete this user.', 'error');
      return;
    }

    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      showToast('User not found.', 'error');
      return;
    }

    const postIdsToDelete = posts.filter(p => p.userId === userId).map(p => p.id);

    // Remove user's posts, and their likes/comments from other posts
    setPosts(prevPosts =>
      prevPosts
        .filter(p => p.userId !== userId)
        .map(p => ({
          ...p,
          likes: p.likes.filter(likeUserId => likeUserId !== userId),
          comments: p.comments.filter(comment => comment.userId !== userId),
        }))
    );

    // Remove user and update following/followers/favorites on other users
    setUsers(prevUsers => {
      const newUsers = prevUsers
        .filter(u => u.id !== userId)
        .map(u => ({
          ...u,
          following: u.following.filter(id => id !== userId),
          followers: u.followers.filter(id => id !== userId),
          favorites: u.favorites.filter(postId => !postIdsToDelete.includes(postId)),
        }));
      
      // Update currentUser state if their own profile data (e.g. following list) changed
      // Logic for admin deleting another user
      if (currentUser.id !== userId) {
        const updatedCurrentUser = newUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) {
          if (JSON.stringify(updatedCurrentUser) !== JSON.stringify(prevUsers.find(u => u.id === currentUser.id))) {
            setCurrentUser(updatedCurrentUser);
          }
        }
      }
      return newUsers;
    });

    // Remove notifications involving the user
    setNotifications(prev => prev.filter(n => n.actorId !== userId && n.recipientId !== userId));

    // Remove messages involving the user
    setMessages(prev => prev.filter(m => m.senderId !== userId && m.recipientId !== userId));

    if (currentUser.id === userId) {
      setCurrentUser(null);
      showToast('Your account has been deleted.', 'success');
    } else {
      showToast(`User '${userToDelete.username}' and all their content has been deleted.`, 'success');
    }
  };

  // FIX: Implement sendMessage function.
  const sendMessage = (recipientId: string, text: string) => {
    if (!currentUser) {
      showToast('You must be logged in to send messages.', 'error');
      return;
    }
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      recipientId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // FIX: Implement markMessagesAsRead function.
  const markMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;
    setMessages(prev =>
      prev.map(m =>
        m.recipientId === currentUser.id && m.senderId === senderId && !m.read
          ? { ...m, read: true }
          : m
      )
    );
  };

  return (
    <AppContext.Provider value={{ 
        currentUser, users, posts, notifications, toast, messages,
        login, logout, signup, createPost, toggleLike, addComment, 
        toggleFollow, showToast, searchQuery, setSearchQuery,
        updateUserProfile, updatePassword, markNotificationsAsRead,
        updateUserAvatar, toggleFavorite, deletePost, deleteComment, deleteUser,
        sendMessage, markMessagesAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};