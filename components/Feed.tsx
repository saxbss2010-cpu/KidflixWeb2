import React, { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import PostCard from './PostCard';

const Feed: React.FC = () => {
  const { posts, searchQuery } = useContext(AppContext);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return posts;
    }
    return posts.filter(post => 
      post.caption.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-400">
            {searchQuery ? 'No posts found.' : 'No posts yet.'}
          </h2>
          <p className="text-gray-500">
             {searchQuery ? 'Try a different search term.' : 'Be the first to share something!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;
