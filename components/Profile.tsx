import React, { useContext, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { User, Post } from '../types';
import { DocumentIcon, BookmarkIcon as BookmarkIconSolid, ServerIcon } from './icons';

interface PostGridProps {
  posts: Post[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-4">
    {posts.map(post => (
      <div key={post.id} className="relative aspect-square group cursor-pointer bg-gray-900 overflow-hidden rounded-xl border border-white/5">
        {post.fileType.startsWith('image/') ? (
          <img src={post.fileUrl} alt={post.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : post.fileType.startsWith('video/') ? (
          <video src={post.fileUrl} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900">
             {post.fileUrl ? (
                <DocumentIcon className="w-12 h-12 text-gray-600"/>
             ) : (
                <p className="text-xs md:text-sm text-gray-400 text-center line-clamp-5 font-medium px-2">
                    {post.caption}
                </p>
             )}
          </div>
        )}
         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex space-x-6 text-white font-bold">
                <span className="flex items-center"><span className="text-xl mr-2">❤️</span> {post.likes.length}</span>
                <span className="flex items-center"><span className="text-xl mr-2">💬</span> {post.comments.length}</span>
            </div>
        </div>
      </div>
    ))}
  </div>
);


const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { users, posts, currentUser, toggleFollow, deleteUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites'>('posts');
  const navigate = useNavigate();

  const profileUser = useMemo(() => users.find(u => u.username === username), [users, username]);
  const userPosts = useMemo(() => posts.filter(p => p.userId === profileUser?.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [posts, profileUser]);
  const favoritePosts = useMemo(() => posts.filter(p => profileUser?.favorites.includes(p.id)), [posts, profileUser]);

  if (!profileUser) {
    return <div className="text-center text-2xl mt-20 text-gray-500">User not found.</div>;
  }
  
  const isFollowing = currentUser ? currentUser.following.includes(profileUser.id) : false;
  const followsYou = currentUser ? profileUser.following.includes(currentUser.id) : false;
  const isOwnProfile = currentUser?.id === profileUser.id;

  const handleFollow = () => {
    if (!isOwnProfile) {
      toggleFollow(profileUser.id);
    }
  }

  const handleDeleteUser = () => {
    if (window.confirm(`Are you sure you want to delete user ${profileUser.username}? This action is irreversible.`)) {
        deleteUser(profileUser.id);
        navigate('/');
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-glass-gradient backdrop-blur-xl border border-glass-border rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-accent to-purple-600 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500"></div>
                <img src={profileUser.avatar} alt={profileUser.username} className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-black" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between mb-4">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-4xl font-bold text-white tracking-tight">{profileUser.username}</h1>
                            {profileUser.role === 'admin' && (
                                <span className="px-2 py-0.5 bg-accent/20 border border-accent/40 text-accent text-xs font-bold rounded uppercase tracking-wider shadow-sm shadow-accent/10">
                                    Admin
                                </span>
                            )}
                        </div>
                        {followsYou && (
                            <span className="text-xs font-medium text-gray-400 bg-white/5 border border-white/5 rounded-full px-3 py-0.5 inline-block mt-2">
                                Follows you
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {currentUser && !isOwnProfile && (
                            <button 
                                onClick={handleFollow} 
                                className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5 ${
                                    isFollowing 
                                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/5' 
                                    : 'bg-gradient-to-r from-accent to-red-600 text-white shadow-accent/30'
                                }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                        {currentUser?.role === 'admin' && !isOwnProfile && (
                            <button onClick={handleDeleteUser} className="px-4 py-2.5 text-sm font-bold rounded-xl bg-red-900/50 text-red-200 hover:bg-red-800 transition-colors border border-red-800/50">
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-center md:justify-start space-x-8 md:space-x-12 mt-6">
                    <div className="text-center md:text-left">
                        <span className="block text-2xl font-bold text-white">{userPosts.length}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Posts</span>
                    </div>
                    <div className="text-center md:text-left">
                        <span className="block text-2xl font-bold text-white">{profileUser.followers.length}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Followers</span>
                    </div>
                    <div className="text-center md:text-left">
                        <span className="block text-2xl font-bold text-white">{profileUser.following.length}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Following</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-center border-b border-white/10 mb-6">
            <button 
                onClick={() => setActiveTab('posts')}
                className={`flex items-center space-x-2 py-4 px-8 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'posts' ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <ServerIcon className="w-4 h-4" />
                <span>POSTS</span>
            </button>
            <button 
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center space-x-2 py-4 px-8 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'favorites' ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <BookmarkIconSolid className="w-4 h-4" />
                <span>FAVORITES</span>
            </button>
        </div>
        
        {activeTab === 'posts' && (
            userPosts.length > 0 ? (
                <PostGrid posts={userPosts} />
            ) : (
                <div className="text-center py-20 bg-glass-gradient rounded-3xl border border-glass-border">
                    <p className="text-gray-500 font-medium">No posts shared yet.</p>
                </div>
            )
        )}
        {activeTab === 'favorites' && (
            favoritePosts.length > 0 ? (
                <PostGrid posts={favoritePosts} />
            ) : (
                <div className="text-center py-20 bg-glass-gradient rounded-3xl border border-glass-border">
                    <p className="text-gray-500 font-medium">No favorites saved.</p>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default Profile;