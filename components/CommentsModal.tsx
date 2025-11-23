
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Post } from '../types';
import { XMarkIcon } from './icons';

interface CommentsModalProps {
  post: Post;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ post, onClose }) => {
  const { users, currentUser, addComment, deleteComment } = useContext(AppContext);
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const author = users.find(u => u.id === post.userId);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to bottom when modal opens or comments change
    scrollToBottom();
  }, [post.comments]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && currentUser) {
      addComment(post.id, commentText.trim());
      setCommentText('');
    }
  };
  
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min ago";
    return Math.floor(seconds) + "s ago";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg relative border border-gray-700 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-xl font-semibold text-white">Comments</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          {author && (
            <div className="mb-4 pb-4 border-b border-gray-700">
              <div className="flex items-start space-x-3">
                <Link to={`/profile/${author.username}`} onClick={onClose}>
                  <img src={author.avatar} alt={author.username} className="w-10 h-10 rounded-full object-cover" />
                </Link>
                <div className="text-sm">
                    <p>
                        <Link to={`/profile/${author.username}`} onClick={onClose} className="font-semibold text-white mr-2 hover:underline">
                            {author.username}
                        </Link>
                        {author.role === 'admin' && (
                            <span className="mr-2 px-1 py-px bg-red-600 text-white text-[9px] font-bold rounded uppercase align-middle">
                            ADM
                            </span>
                        )}
                        {post.caption}
                    </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {post.comments.length > 0 ? (
                post.comments.map(comment => {
                const commentAuthor = users.find(u => u.id === comment.userId);
                if (!commentAuthor) return null;
                return (
                    <div key={comment.id} className="flex items-start space-x-3 group">
                        <Link to={`/profile/${commentAuthor.username}`} onClick={onClose}>
                            <img src={commentAuthor.avatar} alt={commentAuthor.username} className="w-8 h-8 rounded-full object-cover" />
                        </Link>
                        <div className="flex-grow">
                            <p className="text-sm">
                                <Link to={`/profile/${commentAuthor.username}`} onClick={onClose} className="font-semibold text-white mr-2 hover:underline">
                                {commentAuthor.username}
                                </Link>
                                {commentAuthor.role === 'admin' && (
                                    <span className="mr-2 px-1 py-px bg-red-600 text-white text-[9px] font-bold rounded uppercase align-middle">
                                    ADM
                                    </span>
                                )}
                                {comment.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{timeSince(comment.timestamp)}</p>
                        </div>
                         {currentUser?.role === 'admin' && (
                            <button onClick={() => window.confirm('Are you sure you want to delete this comment?') && deleteComment(post.id, comment.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
                })
            ) : (
                <p className="text-gray-500 text-center py-8">No comments yet.</p>
            )}
             <div ref={commentsEndRef} />
          </div>
        </div>

        {currentUser && (
            <form onSubmit={handleCommentSubmit} className="border-t border-gray-800 px-4 py-3 flex flex-shrink-0">
                <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="bg-transparent w-full focus:outline-none text-sm"
                />
                <button type="submit" className="text-accent font-semibold text-sm disabled:text-gray-500" disabled={!commentText.trim()}>
                Post
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;
