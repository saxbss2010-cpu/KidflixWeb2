import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import CreatePostModal from './CreatePostModal';
import { HomeIcon, PlusCircleIcon, SearchIcon, LoginIcon, LogoutIcon, BellIcon, Cog6ToothIcon, XMarkIcon } from './icons';
import { playNotificationSound } from '../services/audioService';

const Header: React.FC = () => {
  const { currentUser, logout, searchQuery, setSearchQuery, notifications } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter(n => n.recipientId === currentUser.id && !n.read).length;
  }, [notifications, currentUser]);

  const prevUnreadCountRef = useRef(unreadNotificationsCount);
  useEffect(() => { 
    if (unreadNotificationsCount > 0 && unreadNotificationsCount > prevUnreadCountRef.current) { 
        playNotificationSound();
    } 
    prevUnreadCountRef.current = unreadNotificationsCount; 
  }, [unreadNotificationsCount]);


  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-secondary/80 backdrop-blur-md z-50 border-b border-gray-700 transition-all duration-300">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
          
          {/* Logo - Hides on small screens when search is focused to give space */}
          <div className={`text-2xl font-bold text-white tracking-tighter cursor-default transition-all duration-300 ${isSearchFocused ? 'hidden md:block opacity-50' : 'block'}`}>
            <Link to="/" className="flex items-center">
                Web
                <span className="relative inline-block">
                    <span style={{ fontFamily: "'Dancing Script', cursive" }} className="ml-1">free</span>
                    <span className="absolute -top-1 left-1 w-[90%] h-1 bg-accent rounded-sm"></span>
                </span>
            </Link>
          </div>

          {/* Innovative Search Bar */}
          <div className={`relative transition-all duration-500 ease-out mx-auto z-10 ${isSearchFocused ? 'flex-grow max-w-2xl' : 'flex-grow max-w-md'}`}>
            {/* Animated Glow Background */}
            <div 
                className={`absolute -inset-[2px] bg-gradient-to-r from-accent via-purple-600 to-accent rounded-full opacity-0 blur-md transition-opacity duration-500 ${isSearchFocused ? 'opacity-60 animate-pulse' : ''}`}
            ></div>
            
            {/* Search Input Container */}
            <div className={`relative flex items-center bg-gray-900/90 backdrop-blur-sm rounded-full border shadow-2xl transition-all duration-300 overflow-hidden ${isSearchFocused ? 'border-accent/50 ring-1 ring-accent/20' : 'border-gray-700 hover:border-gray-500'}`}>
                
                {/* Search Icon */}
                <div className={`pl-4 pr-2 transition-transform duration-300 ${isSearchFocused ? 'text-accent scale-110' : 'text-gray-500'}`}>
                    <SearchIcon className="w-5 h-5" />
                </div>
                
                <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-500 py-2.5 px-1 focus:outline-none font-medium tracking-wide text-sm md:text-base transition-all"
                    placeholder={isSearchFocused ? "Search posts, people, or tags..." : "Search WebFree..."}
                />

                {/* Clear Button - Animate in/out */}
                <div className={`pr-2 flex items-center transition-all duration-300 ease-in-out ${searchQuery ? 'opacity-100 translate-x-0 w-8' : 'opacity-0 translate-x-4 w-0'}`}>
                     <button 
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        aria-label="Clear search"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {currentUser ? (
              <>
                <Link to="/" aria-label="Home" className="text-gray-300 hover:text-white transition-colors hidden sm:block">
                    <HomeIcon className="w-7 h-7" />
                </Link>
                <button onClick={() => setIsModalOpen(true)} aria-label="Create Post" className="text-gray-300 hover:text-white transition-colors">
                    <PlusCircleIcon className="w-7 h-7" />
                </button>
                <Link to="/notifications" aria-label="Notifications" className="relative text-gray-300 hover:text-white transition-colors">
                    <BellIcon className="w-7 h-7" />
                    {unreadNotificationsCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-secondary animate-bounce"></span>
                    )}
                </Link>
                 <Link to="/settings" aria-label="Settings" className="text-gray-300 hover:text-white transition-colors hidden sm:block">
                    <Cog6ToothIcon className="w-7 h-7" />
                </Link>
                <Link to={`/profile/${currentUser.username}`} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <img src={currentUser.avatar} alt={currentUser.username} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-accent transition-all" />
                </Link>
                <button onClick={handleLogout} aria-label="Logout" className="text-gray-300 hover:text-white transition-colors hidden sm:block">
                    <LogoutIcon className="w-7 h-7" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
                  <LoginIcon className="w-5 h-5" />
                  <span className="hidden md:inline">Login</span>
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover transition-colors font-semibold whitespace-nowrap">
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