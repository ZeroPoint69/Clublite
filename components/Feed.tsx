
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
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    const unsubscribe = subscribeToFeed(() => {
        loadPosts();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto pb-20 sm:pt-4">
      {/* Post Box at the top of the serial */}
      <CreatePost currentUser={currentUser} />
      
      <div className="flex flex-col gap-3 sm:gap-4">
        {loading ? (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        ) : (
          <>
            {posts.map(post => (
              <PostItem key={post.id} post={post} currentUser={currentUser} />
            ))}
            
            {posts.length === 0 && (
                <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-gray-500 shadow-sm mx-2 sm:mx-0">
                    <p className="font-medium">এখনও কোনো পোস্ট নেই।</p>
                    <p className="text-sm">প্রথম পোস্টটি আপনিই করুন!</p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;
