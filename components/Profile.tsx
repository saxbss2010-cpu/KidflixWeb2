
import React, { useContext, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { User, Post } from '../types';
import { DocumentIcon, BookmarkIcon as BookmarkIconSolid, ServerIcon } from './icons';

interface PostGridProps {
  posts: Post[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-4 p-1 md:p-4">
    {posts.map(post => (
      <div key={post.id} className="relative aspect-square group cursor-pointer border border-gray-800 bg-secondary">
        {post.fileType.startsWith('image/') ? (
          <img src={post.fileUrl} alt={post.caption} className="w-full h-full object-cover" />
        ) : post.fileType.startsWith('video/') ? (
          <video src={post.fileUrl} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
             {post.fileUrl ? (
                <DocumentIcon className="w-16 h-16 text-gray-600"/>
             ) : (
                <p className="text-xs md:text-sm text-gray-300 text-center line-clamp-5 break-words font-medium">
                    {post.caption}
                </p>
             )}
          </div>
        )}
         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center text-white text-lg font-bold opacity-0 group-hover:opacity-100">
          <span>❤️ {post.likes.length}</span>
          <span className="ml-4">💬 {post.comments.length}</span>
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
    return <div className="text-center text-2xl mt-20">User not found.</div>;
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
    if (window.confirm(`Are you sure you want to delete user ${profileUser.username}? This action is irreversible and will remove all their posts and comments.`)) {
        deleteUser(profileUser.id);
        navigate('/');
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center">
          <img src={profileUser.avatar} alt={profileUser.username} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-700" />
          <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-white">{profileUser.username}</h1>
                    {profileUser.role === 'admin' && (
                        <span className="ml-3 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase">
                            ADM
                        </span>
                    )}
                </div>
                {currentUser && !isOwnProfile && (
                    <div className="flex items-center space-x-2">
                        <button onClick={handleFollow} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isFollowing ? 'bg-gray-600 text-gray-200' : 'bg-accent text-white hover:bg-accent-hover'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                )}
                {currentUser?.role === 'admin' && !isOwnProfile && (
                    <button onClick={handleDeleteUser} className="px-4 py-2 text-sm font-semibold rounded-md bg-red-800 text-white hover:bg-red-700 transition-colors">
                        Delete User
                    </button>
                )}
            </div>
             {followsYou && (
                <p className="text-sm text-gray-400 bg-gray-700 rounded-md px-2 py-1 inline-block mt-2">Follows you</p>
            )}
            <div className="flex justify-center md:justify-start space-x-6 mt-4 text-lg">
              <div><span className="font-bold text-white">{userPosts.length}</span> <span className="text-gray-400">posts</span></div>
              <div><span className="font-bold text-white">{profileUser.followers.length}</span> <span className="text-gray-400">followers</span></div>
              <div><span className="font-bold text-white">{profileUser.following.length}</span> <span className="text-gray-400">following</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8">
        <div className="flex justify-center border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('posts')}
                className={`flex items-center space-x-2 py-3 px-6 font-semibold transition-colors border-t-2 ${activeTab === 'posts' ? 'border-accent text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
                <ServerIcon className="w-5 h-5" />
                <span>POSTS</span>
            </button>
            <button 
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center space-x-2 py-3 px-6 font-semibold transition-colors border-t-2 ${activeTab === 'favorites' ? 'border-accent text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
                <BookmarkIconSolid className="w-5 h-5" />
                <span>FAVORITES</span>
            </button>
        </div>
        
        {activeTab === 'posts' && (
            userPosts.length > 0 ? (
                <PostGrid posts={userPosts} />
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">No posts yet.</p>
                </div>
            )
        )}
        {activeTab === 'favorites' && (
            favoritePosts.length > 0 ? (
                <PostGrid posts={favoritePosts} />
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">No favorite posts yet.</p>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default Profile;
