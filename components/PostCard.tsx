
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
    if (post.fileType.startsWith('image/')) {
      return <img src={post.fileUrl} alt={post.caption} className="w-full object-cover" />;
    }
    if (post.fileType.startsWith('video/')) {
      return <video src={post.fileUrl} controls className="w-full"></video>;
    }
    return (
      <div className="bg-gray-800 p-6 flex flex-col items-center justify-center h-64">
        <DocumentIcon className="w-16 h-16 text-gray-500 mb-4" />
        <p className="text-gray-400 font-medium">{post.fileName}</p>
        <a href={post.fileUrl} download={post.fileName} className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">
          Download
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
      <div className="bg-secondary rounded-lg overflow-hidden border border-gray-800">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <Link to={`/profile/${author.username}`}>
                  <img src={author.avatar} alt={author.username} className="w-10 h-10 rounded-full object-cover" />
              </Link>
              <div className="flex items-center">
                  <Link to={`/profile/${author.username}`} className="font-semibold text-white hover:underline">
                      {author.username}
                  </Link>
                  {author.role === 'admin' && (
                    <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase">
                      ADM
                    </span>
                  )}
              </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && currentUser.id !== author.id && (
                <button onClick={handleFollow} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${isFollowing ? 'bg-gray-600 text-gray-200' : 'bg-accent text-white hover:bg-accent-hover'}`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
            {currentUser?.role === 'admin' && (
              <button onClick={() => window.confirm('Are you sure you want to delete this post?') && deletePost(post.id)} aria-label="Delete post" title="Delete Post" className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-black">
          {renderFile()}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
              <div className="flex space-x-4">
                  <button onClick={() => toggleLike(post.id)} className="flex items-center space-x-1">
                      <HeartIcon className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-gray-300 hover:text-gray-400'}`} />
                  </button>
                  <button onClick={() => setIsCommentsModalOpen(true)}><ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 text-gray-300 hover:text-gray-400" /></button>
                  <button onClick={handleShare}><PaperAirplaneIcon className="w-7 h-7 text-gray-300 hover:text-gray-400" /></button>
              </div>
              <button onClick={() => toggleFavorite(post.id)}>
                <BookmarkIcon className={`w-7 h-7 transition-colors ${isFavorited ? 'text-accent fill-current' : 'text-gray-300 hover:text-gray-400'}`} />
              </button>
          </div>

          <p className="font-semibold text-white">{post.likes.length} likes</p>

          <div className="mt-2">
              <p>
                <span className="font-semibold text-white mr-2">{author.username}</span>
                {post.caption}
              </p>
          </div>
          
          <div className="mt-2">
              {post.comments.length > 2 && <button onClick={() => setIsCommentsModalOpen(true)} className="text-sm text-gray-500 mt-1 hover:underline">View all {post.comments.length} comments</button>}
              {post.comments.length > 0 && post.comments.slice(0, 2).map(comment => {
                  const commentAuthor = users.find(u => u.id === comment.userId);
                  return (
                      <div key={comment.id} className="text-sm">
                          <p>
                            <span className="font-semibold text-white mr-2">
                              {commentAuthor?.username}
                              {commentAuthor?.role === 'admin' && (
                                <span className="ml-1 mr-1 px-1 py-px bg-red-600 text-white text-[9px] font-bold rounded uppercase align-middle">
                                  ADM
                                </span>
                              )}
                            </span>
                            {comment.text}
                          </p>
                      </div>
                  );
              })}
          </div>
          
          <p className="text-xs text-gray-500 uppercase mt-3">{timeSince(post.timestamp)} ago</p>

        </div>
          {currentUser && (
              <form onSubmit={handleCommentSubmit} className="border-t border-gray-800 px-4 py-2 flex">
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
      {isCommentsModalOpen && <CommentsModal post={post} onClose={() => setIsCommentsModalOpen(false)} />}
    </>
  );
};

export default PostCard;
