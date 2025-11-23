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
                <Link to={`/profile/${actor.username}`} className="font-bold hover:underline">{actor.username}</Link> has created a new post.
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
    <div className="max-w-2xl mx-auto bg-secondary rounded-lg border border-gray-700 shadow-lg">
        <h1 className="text-2xl font-bold text-white p-6 border-b border-gray-700">Notifications</h1>
        <div className="divide-y divide-gray-700">
            {userNotifications.length > 0 ? (
                userNotifications.map(notification => {
                     const actor = users.find(u => u.id === notification.actorId);
                     if(!actor) return null;
                    return (
                        <div key={notification.id} className={`p-4 flex items-start space-x-4 ${!notification.read ? 'bg-accent/10' : ''}`}>
                             <Link to={`/profile/${actor.username}`}>
                                <img src={actor.avatar} alt={actor.username} className="w-10 h-10 rounded-full object-cover"/>
                            </Link>
                            <div className="flex-1">
                                <p className="text-gray-300">
                                    {getNotificationMessage(notification)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{timeSince(notification.timestamp)} ago</p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <BellIcon className="w-16 h-16 mx-auto mb-4"/>
                    <h2 className="text-xl font-semibold">No notifications yet</h2>
                    <p>Updates about your account will appear here.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Notifications;
