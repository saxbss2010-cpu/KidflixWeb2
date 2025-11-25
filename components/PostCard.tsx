import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Post } from '../types';
import { HeartIcon, ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, BookmarkIcon, DocumentIcon, XMarkIcon } from './icons';
import CommentsModal from './CommentsModal';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { users, currentUser, toggleLike, addComment, toggleFollow, showToast, toggleFavorite, deletePost } = useContext(AppContext);
  const [commentText, setCommentText] = useState('');
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  const author = useMemo(() => users.find(u => u.id === post.userId), [users, post.userId]);

  if (!author) return null;

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isFollowing = currentUser ? currentUser.following.includes(author.id) : false;
  const isFavorited = currentUser ? currentUser.favorites.includes(post.id) : false;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(post.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleFollow = () => {
    if (currentUser && currentUser.id !== author.id) {
      toggleFollow(author.id);
    }
  };
  
  const handleShare = () => {
    const postUrl = `${window.location.origin}${window.location.pathname}#/profile/${author.username}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        showToast('Link copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy link.', 'error');
      });
  };

  const renderFile = () => {
    if (!post.fileUrl) return null;

    if (post.fileType.startsWith('image/')) {
      return <img src={post.fileUrl} alt={post.caption} className="w-full object-cover max-h-[600px]" />;
    }
    if (post.fileType.startsWith('video/')) {
      return <video src={post.fileUrl} controls className="w-full max-h-[600px] bg-black"></video>;
    }
    return (
      <div className="bg-gray-800/50 p-8 flex flex-col items-center justify-center h-64 border-y border-white/5">
        <DocumentIcon className="w-16 h-16 text-gray-500 mb-4" />
        <p className="text-gray-300 font-medium">{post.fileName}</p>
        <a href={post.fileUrl} download={post.fileName} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 backdrop-blur-sm">
          Download File
        </a>
      </div>
    );
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
    <>
      <div className="bg-glass-gradient backdrop-blur-xl rounded-3xl overflow-hidden border border-glass-border shadow-2xl transition-all hover:border-white/20">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <Link to={`/profile/${author.username}`} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
                  <img src={author.avatar} alt={author.username} className="relative w-10 h-10 rounded-full object-cover ring-2 ring-black" />
              </Link>
              <div className="flex flex-col">
                  <div className="flex items-center">
                    <Link to={`/profile/${author.username}`} className="font-bold text-white hover:text-accent transition-colors">
                        {author.username}
                    </Link>
                    {author.role === 'admin' && (
                        <span className="ml-2 px-1.5 py-0.5 bg-accent/20 border border-accent/30 text-accent text-[10px] font-bold rounded uppercase tracking-wider">
                        ADM
                        </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{timeSince(post.timestamp)} ago</span>
              </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && currentUser.id !== author.id && (
                <button 
                    onClick={handleFollow} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
                        isFollowing 
                        ? 'bg-white/10 text-gray-300 border border-white/5 hover:bg-white/20' 
                        : 'bg-accent text-white shadow-lg shadow-accent/20 hover:scale-105 hover:bg-accent-hover'
                    }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
            {currentUser?.role === 'admin' && (
              <button onClick={() => window.confirm('Are you sure you want to delete this post?') && deletePost(post.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                  <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-black/40">
          {renderFile()}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                  <button onClick={() => toggleLike(post.id)} className="group flex items-center gap-1">
                      <HeartIcon className={`w-7 h-7 transition-all duration-300 transform group-hover:scale-110 ${isLiked ? 'text-accent fill-accent' : 'text-gray-300 hover:text-accent'}`} />
                  </button>
                  <button onClick={() => setIsCommentsModalOpen(true)} className="group">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 text-gray-300 group-hover:text-blue-400 transition-colors transform group-hover:scale-110 duration-300" />
                  </button>
                  <button onClick={handleShare} className="group">
                    <PaperAirplaneIcon className="w-7 h-7 text-gray-300 group-hover:text-green-400 transition-colors transform group-hover:scale-110 duration-300" />
                  </button>
              </div>
              <button onClick={() => toggleFavorite(post.id)} className="group">
                <BookmarkIcon className={`w-7 h-7 transition-all duration-300 transform group-hover:scale-110 ${isFavorited ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
              </button>
          </div>

          {post.likes.length > 0 && (
            <p className="font-bold text-white text-sm mb-2">{post.likes.length} like{post.likes.length !== 1 ? 's' : ''}</p>
          )}

          <div className="mb-4">
              <p className="text-gray-200 leading-relaxed">
                <span className="font-bold text-white mr-2">{author.username}</span>
                {post.caption}
              </p>
          </div>
          
          <div className="space-y-1.5">
              {post.comments.length > 0 && post.comments.slice(0, 2).map(comment => {
                  const commentAuthor = users.find(u => u.id === comment.userId);
                  return (
                      <div key={comment.id} className="text-sm flex items-start">
                          <span className="font-bold text-white mr-2 whitespace-nowrap">
                            {commentAuthor?.username}
                          </span>
                          <span className="text-gray-400 line-clamp-1">{comment.text}</span>
                      </div>
                  );
              })}
              {post.comments.length > 2 && (
                  <button onClick={() => setIsCommentsModalOpen(true)} className="text-sm text-gray-500 hover:text-gray-300 transition-colors mt-2 font-medium">
                    View all {post.comments.length} comments
                  </button>
              )}
          </div>
        </div>
          {currentUser && (
              <div className="px-5 pb-5 pt-1">
                <form onSubmit={handleCommentSubmit} className="relative flex items-center">
                    <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-black/30 border border-white/5 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 placeholder-gray-500 transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!commentText.trim()}
                        className="absolute right-2 text-accent font-bold text-xs px-3 py-1.5 rounded-full hover:bg-accent/10 disabled:opacity-0 transition-all"
                    >
                    Post
                    </button>
                </form>
              </div>
          )}
      </div>
      {isCommentsModalOpen && <CommentsModal post={post} onClose={() => setIsCommentsModalOpen(false)} />}
    </>
  );
};

export default PostCard;