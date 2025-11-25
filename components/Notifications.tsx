import React, { useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { BellIcon } from './icons';

const Notifications: React.FC = () => {
  const { currentUser, notifications, users, markNotificationsAsRead } = useContext(AppContext);

  useEffect(() => {
    markNotificationsAsRead();
  }, []);

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications
      .filter(n => n.recipientId === currentUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [currentUser, notifications]);

  const getNotificationMessage = (notification: typeof userNotifications[0]) => {
    const actor = users.find(u => u.id === notification.actorId);
    if (!actor) return null;

    switch (notification.type) {
      case 'NEW_POST':
        return (
            <>
                <Link to={`/profile/${actor.username}`} className="font-bold text-white hover:text-accent transition-colors">{actor.username}</Link> <span className="text-gray-300">shared a new post.</span>
            </>
        );
      default:
        return null;
    }
  };
  
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return Math.floor(seconds) + "s";
  }

  return (
    <div className="max-w-2xl mx-auto bg-glass-gradient backdrop-blur-xl rounded-3xl border border-glass-border shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
             <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>
        
        <div className="divide-y divide-white/5">
            {userNotifications.length > 0 ? (
                userNotifications.map(notification => {
                     const actor = users.find(u => u.id === notification.actorId);
                     if(!actor) return null;
                    return (
                        <div key={notification.id} className={`p-5 flex items-start space-x-4 transition-colors ${!notification.read ? 'bg-accent/5' : 'hover:bg-white/5'}`}>
                             <Link to={`/profile/${actor.username}`} className="flex-shrink-0">
                                <img src={actor.avatar} alt={actor.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"/>
                            </Link>
                            <div className="flex-1 pt-1">
                                <p className="text-sm leading-relaxed">
                                    {getNotificationMessage(notification)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">{timeSince(notification.timestamp)} ago</p>
                            </div>
                            {!notification.read && (
                                <span className="w-2 h-2 bg-accent rounded-full mt-3"></span>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-24 text-gray-500">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BellIcon className="w-10 h-10 text-gray-600"/>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">All caught up</h2>
                    <p className="text-sm">Notifications about your activity will show up here.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Notifications;