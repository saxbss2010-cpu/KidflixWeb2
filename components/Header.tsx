
import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import CreatePostModal from './CreatePostModal';
import { HomeIcon, PlusCircleIcon, SearchIcon, LoginIcon, LogoutIcon, BellIcon, Cog6ToothIcon, GlobeAltIcon, ChatBubbleLeftRightIcon } from './icons';
import { playNotificationSound } from '../services/audioService';

const Header: React.FC = () => {
  const { currentUser, logout, searchQuery, setSearchQuery, notifications, messages } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter(n => n.recipientId === currentUser.id && !n.read).length;
  }, [notifications, currentUser]);

  const unreadMessagesCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter(m => m.recipientId === currentUser.id && !m.read).length;
  }, [messages, currentUser]);

  const prevUnreadCountRef = useRef(unreadNotificationsCount);
  useEffect(() => { 
    if (unreadNotificationsCount > 0 && unreadNotificationsCount > prevUnreadCountRef.current) { 
        playNotificationSound();
    } 
    prevUnreadCountRef.current = unreadNotificationsCount; 
  }, [unreadNotificationsCount]);


  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-secondary/80 backdrop-blur-md z-50 border-b border-gray-700">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="text-2xl font-bold text-white tracking-tighter hidden sm:block cursor-default">
            Kid
            <span className="relative inline-block">
                <span style={{ fontFamily: "'Dancing Script', cursive" }} className="ml-1">flix</span>
                <span className="absolute -top-1 left-1 w-[90%] h-1 bg-accent rounded-sm"></span>
            </span>
          </div>

          <div className="relative flex-grow max-w-lg mx-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {currentUser ? (
              <>
                <Link to="/" aria-label="Home" className="text-gray-300 hover:text-white transition-colors">
                    <HomeIcon className="w-7 h-7" />
                </Link>
                <Link to="/network" aria-label="Network Database" className="text-gray-300 hover:text-white transition-colors">
                    <GlobeAltIcon className="w-7 h-7" />
                </Link>
                <button onClick={() => setIsModalOpen(true)} aria-label="Create Post" className="text-gray-300 hover:text-white transition-colors">
                    <PlusCircleIcon className="w-7 h-7" />
                </button>
                <Link to="/messages" aria-label="Messages" className="relative text-gray-300 hover:text-white transition-colors">
                    <ChatBubbleLeftRightIcon className="w-7 h-7" />
                    {unreadMessagesCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent ring-2 ring-secondary"></span>
                    )}
                </Link>
                <Link to="/notifications" aria-label="Notifications" className="relative text-gray-300 hover:text-white transition-colors">
                    <BellIcon className="w-7 h-7" />
                    {unreadNotificationsCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-secondary"></span>
                    )}
                </Link>
                 <Link to="/settings" aria-label="Settings" className="text-gray-300 hover:text-white transition-colors">
                    <Cog6ToothIcon className="w-7 h-7" />
                </Link>
                <Link to={`/profile/${currentUser.username}`} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <img src={currentUser.avatar} alt={currentUser.username} className="w-8 h-8 rounded-full object-cover" />
                </Link>
                <button onClick={handleLogout} aria-label="Logout" className="text-gray-300 hover:text-white transition-colors">
                    <LogoutIcon className="w-7 h-7" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
                  <LoginIcon className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover transition-colors font-semibold">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default Header;
