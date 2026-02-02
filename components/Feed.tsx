import React, { useEffect, useState } from 'react';
import { User, Post } from '../types';
import { getPosts, subscribeToFeed } from '../services/dataService';
import CreatePost from './CreatePost';
import PostItem from './PostItem';
import { Loader2 } from 'lucide-react';

interface FeedProps {
  currentUser: User;
}

const Feed: React.FC<FeedProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data); // getPosts already sorts them by timestamp descending
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    // Subscribe to realtime updates
    const unsubscribe = subscribeToFeed(() => {
        loadPosts();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto pb-20 pt-4">
      <CreatePost currentUser={currentUser} />
      
      {loading ? (
          <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={32} />
          </div>
      ) : (
        <div className="space-y-4">
            {posts.map(post => (
            <PostItem key={post.id} post={post} currentUser={currentUser} />
            ))}
            {posts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No posts yet. Be the first to share!</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Feed;