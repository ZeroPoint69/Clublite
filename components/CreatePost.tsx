import React, { useState } from 'react';
import { User, Post } from '../types';
import { createPost } from '../services/dataService';
import { polishText } from '../services/geminiService';
import Avatar from './Avatar';
import { Sparkles, Loader2, Image as ImageIcon, Send } from 'lucide-react';

interface CreatePostProps {
  currentUser: User;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser }) => {
  const [content, setContent] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);

    const newPost: Post = {
      // Use standard crypto.randomUUID() which is available in all modern browsers (secure contexts)
      // fallback to a simple random string format if needed, but DB expects UUID.
      id: crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-' + Date.now().toString(16).padStart(12, '0'),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      timestamp: Date.now(),
      likes: [],
      commentCount: 0
    };

    try {
        await createPost(newPost);
        setContent('');
    } catch (e) {
        console.error("Error creating post", e);
    } finally {
        setIsPosting(false);
    }
  };

  const handlePolish = async () => {
    if (!content.trim()) return;
    setIsPolishing(true);
    try {
      const polished = await polishText(content);
      setContent(polished);
    } catch (e) {
      alert("Could not polish text. Check API Key.");
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="bg-surface p-4 shadow-sm mb-4 border-b border-gray-200 md:rounded-lg md:border">
      <div className="flex gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
            className="w-full bg-gray-100 rounded-2xl px-4 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
            disabled={isPosting}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:bg-gray-100 rounded-md transition-colors text-sm font-medium">
             <ImageIcon size={18} className="text-green-500" />
             <span className="hidden sm:inline">Photo</span>
          </button>
          
          <button 
            onClick={handlePolish}
            disabled={isPolishing || !content || isPosting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
              isPolishing ? 'text-purple-400' : 'text-purple-600 hover:bg-purple-50'
            }`}
          >
            {isPolishing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            <span className="hidden sm:inline">{isPolishing ? 'Magic working...' : 'AI Polish'}</span>
          </button>
        </div>

        <button
          onClick={handlePost}
          disabled={!content.trim() || isPosting}
          className="bg-primary text-white px-6 py-1.5 rounded-full font-semibold text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePost;