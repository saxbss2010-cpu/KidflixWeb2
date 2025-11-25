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
    <div className="flex h-[80vh] max-w-6xl mx-auto bg-glass-gradient backdrop-blur-2xl rounded-3xl border border-glass-border overflow-hidden shadow-2xl">
      {/* Conversation List */}
      <div className={`w-full md:w-1/3 border-r border-white/5 flex flex-col bg-black/20 ${username && 'hidden md:flex'}`}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white">Chats</h2>
        </div>
        <div className="overflow-y-auto flex-grow p-2 space-y-1">
          {conversations.length > 0 ? conversations.map(({ user, lastMessage }) => {
            const unreadCount = getUnreadCount(user.id);
            const isSelected = selectedUser?.id === user.id;
            return (
                <Link 
                    key={user.id} 
                    to={`/messages/${user.username}`} 
                    className={`flex items-center p-4 space-x-4 rounded-xl transition-all ${
                        isSelected 
                        ? 'bg-white/10 shadow-lg' 
                        : 'hover:bg-white/5'
                    }`}
                >
                <div className="relative">
                    <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent" />
                    {unreadCount > 0 && 
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 text-xs items-center justify-center rounded-full bg-accent text-white ring-2 ring-black font-bold">{unreadCount}</span>
                    }
                </div>
                <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline">
                        <p className={`font-bold truncate ${unreadCount > 0 ? 'text-white' : 'text-gray-200'}`}>{user.username}</p>
                        <span className="text-xs text-gray-500">{new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${unreadCount > 0 ? 'text-gray-100 font-medium' : 'text-gray-400'}`}>
                        {lastMessage.senderId === currentUser.id ? <span className="text-gray-500">You: </span> : ''}
                        {lastMessage.text}
                    </p>
                </div>
                </Link>
            )
          }) : <p className="p-8 text-center text-gray-500">No conversations yet.</p>}
        </div>
      </div>
      
      {/* Chat Window */}
      <div className={`w-full md:w-2/3 flex flex-col bg-black/40 ${!username && 'hidden md:flex'}`}>
      {selectedUser ? (
        <>
            <div className="p-4 border-b border-white/5 flex items-center space-x-4 flex-shrink-0 bg-white/5 backdrop-blur-md">
                <button onClick={() => navigate('/messages')} className="md:hidden text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <Link to={`/profile/${selectedUser.username}`} className="relative">
                   <div className="absolute inset-0 bg-accent rounded-full blur opacity-20"></div>
                   <img src={selectedUser.avatar} alt={selectedUser.username} className="relative w-10 h-10 rounded-full object-cover ring-1 ring-white/10"/>
                </Link>
                <Link to={`/profile/${selectedUser.username}`} className="font-bold text-white text-lg hover:text-accent transition-colors">{selectedUser.username}</Link>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto space-y-3 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed">
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.senderId !== currentUser.id && <img src={selectedUser.avatar} alt={selectedUser.username} className="w-8 h-8 rounded-full object-cover self-bottom mb-1 shadow-md"/>}
                        <div className={`max-w-[75%] px-5 py-3 shadow-lg backdrop-blur-sm ${
                            msg.senderId === currentUser.id 
                            ? 'bg-gradient-to-br from-accent to-red-600 text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white/10 border border-white/5 text-gray-100 rounded-2xl rounded-tl-sm'
                        }`}>
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.senderId === currentUser.id ? 'text-white/70' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex items-center space-x-3 flex-shrink-0 bg-black/40 backdrop-blur-md">
                <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder-gray-500"
                />
                <button type="submit" disabled={!messageText.trim()} className="bg-accent rounded-full p-3 text-white hover:bg-accent-hover shadow-lg shadow-accent/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        </>
      ) : (
        <div className="flex w-full h-full items-center justify-center text-gray-500 flex-col opacity-60">
             <div className="bg-white/5 p-8 rounded-full mb-6">
                <ChatBubbleLeftRightIcon className="w-24 h-24 text-gray-600"/>
             </div>
             <p className="text-2xl font-bold text-gray-300">Your Messages</p>
             <p className="mt-2 text-gray-500">Select a conversation to start chatting.</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default Messages;