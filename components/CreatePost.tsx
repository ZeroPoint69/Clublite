
import React, { useState, useRef } from 'react';
import { User, Post } from '../types';
import { createPost } from '../services/dataService';
import { polishText } from '../services/geminiService';
import Avatar from './Avatar';
import { Sparkles, Loader2, Image as ImageIcon, Send, X } from 'lucide-react';

interface CreatePostProps {
  currentUser: User;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedImage) return;
    setIsPosting(true);

    const newPost: Post = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      image: selectedImage || undefined,
      timestamp: Date.now(),
      likes: [],
      commentCount: 0
    };

    try {
        await createPost(newPost);
        setContent('');
        setSelectedImage(null);
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
      alert("AI text polish failed. Please try again.");
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
            className="w-full bg-gray-100 rounded-2xl px-4 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all text-[15px]"
            disabled={isPosting}
          />
        </div>
      </div>

      {selectedImage && (
        <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200">
           <img src={selectedImage} alt="Selected preview" className="w-full h-auto max-h-64 object-cover" />
           <button 
             onClick={() => setSelectedImage(null)}
             className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
           >
             <X size={18} />
           </button>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        className="hidden" 
      />
      
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <div className="flex gap-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
          >
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
            <span className="hidden sm:inline">{isPolishing ? 'Polishing...' : 'AI Polish'}</span>
          </button>
        </div>

        <button
          onClick={handlePost}
          disabled={(!content.trim() && !selectedImage) || isPosting}
          className="bg-primary text-white px-6 py-1.5 rounded-full font-bold text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
