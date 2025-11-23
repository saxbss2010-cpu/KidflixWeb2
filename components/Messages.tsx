
import React, { useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { User, Message } from '../types';
import { PaperAirplaneIcon, ArrowLeftIcon, ChatBubbleLeftRightIcon } from './icons';

const Messages: React.FC = () => {
  const { currentUser, users, messages, sendMessage, markMessagesAsRead } = useContext(AppContext);
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const conversations = useMemo(() => {
    if (!currentUser) return [];
    const conversationPartners = new Map<string, { user: User, lastMessage: Message }>();
    
    messages
      .filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .forEach(m => {
        const partnerId = m.senderId === currentUser.id ? m.recipientId : m.senderId;
        if (!conversationPartners.has(partnerId)) {
          const user = users.find(u => u.id === partnerId);
          if (user) {
            conversationPartners.set(partnerId, { user, lastMessage: m });
          }
        }
      });

    return Array.from(conversationPartners.values());
  }, [messages, currentUser, users]);

  const selectedUser = useMemo(() => {
    return users.find(u => u.username === username);
  }, [username, users]);

  const chatMessages = useMemo(() => {
    if (!currentUser || !selectedUser) return [];
    return messages.filter(
      m =>
        (m.senderId === currentUser.id && m.recipientId === selectedUser.id) ||
        (m.senderId === selectedUser.id && m.recipientId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, currentUser, selectedUser]);
  
  const memoizedMarkMessagesAsRead = useCallback(markMessagesAsRead, [markMessagesAsRead]);

  useEffect(() => {
      if (selectedUser) {
          memoizedMarkMessagesAsRead(selectedUser.id);
      }
  }, [selectedUser, chatMessages, memoizedMarkMessagesAsRead]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedUser) {
      sendMessage(selectedUser.id, messageText.trim());
      setMessageText('');
    }
  };
  
  const getUnreadCount = (partnerId: string) => {
      if (!currentUser) return 0;
      return messages.filter(m => m.senderId === partnerId && m.recipientId === currentUser.id && !m.read).length;
  }

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto bg-secondary rounded-lg border border-gray-700 overflow-hidden">
      {/* Conversation List */}
      <div className={`w-full md:w-1/3 border-r border-gray-700 flex flex-col ${username && 'hidden md:flex'}`}>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Chats</h2>
        </div>
        <div className="overflow-y-auto flex-grow">
          {conversations.length > 0 ? conversations.map(({ user, lastMessage }) => {
            const unreadCount = getUnreadCount(user.id);
            return (
                <Link key={user.id} to={`/messages/${user.username}`} className={`flex items-center p-3 space-x-3 hover:bg-gray-800 transition-colors ${selectedUser?.id === user.id ? 'bg-accent/20' : ''}`}>
                <div className="relative">
                    <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                    {unreadCount > 0 && 
                        <span className="absolute -top-1 -right-1 block h-5 w-5 text-xs flex items-center justify-center rounded-full bg-red-500 text-white ring-2 ring-secondary">{unreadCount}</span>
                    }
                </div>
                <div className="flex-grow overflow-hidden">
                    <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>{user.username}</p>
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-200' : 'text-gray-400'}`}>{lastMessage.senderId === currentUser.id ? 'You: ' : ''}{lastMessage.text}</p>
                </div>
                </Link>
            )
          }) : <p className="p-4 text-gray-500">No conversations yet.</p>}
        </div>
      </div>
      
      {/* Chat Window */}
      <div className={`w-full md:w-2/3 flex flex-col ${!username && 'hidden md:flex'}`}>
      {selectedUser ? (
        <>
            <div className="p-3 border-b border-gray-700 flex items-center space-x-3 flex-shrink-0">
                <button onClick={() => navigate('/messages')} className="md:hidden text-gray-300 hover:text-white p-1 rounded-full hover:bg-gray-700">
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <Link to={`/profile/${selectedUser.username}`}>
                  <img src={selectedUser.avatar} alt={selectedUser.username} className="w-10 h-10 rounded-full object-cover"/>
                </Link>
                <Link to={`/profile/${selectedUser.username}`} className="font-bold text-white text-lg hover:underline">{selectedUser.username}</Link>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-primary/50">
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.senderId !== currentUser.id && <img src={selectedUser.avatar} alt={selectedUser.username} className="w-6 h-6 rounded-full object-cover self-start"/>}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-accent text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex items-center space-x-3 flex-shrink-0">
                <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
                <button type="submit" disabled={!messageText.trim()} className="bg-accent rounded-full p-3 text-white hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        </>
      ) : (
        <div className="flex w-full h-full items-center justify-center text-gray-500">
            <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-24 h-24 mx-auto text-gray-600"/>
                <p className="text-xl mt-4 font-bold">Your Messages</p>
                <p>Select a conversation to start chatting.</p>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Messages;
