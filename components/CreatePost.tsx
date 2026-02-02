
import React, { useState, useRef, useEffect } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

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
    <div className="bg-surface p-3 shadow-sm mb-4 border-b border-gray-200 md:rounded-xl md:border transition-all">
      <div className="flex items-start gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" className="mt-1" />
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-end px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind?`}
              rows={1}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-[16px] text-text py-1 max-h-40 no-scrollbar overflow-y-auto"
              disabled={isPosting}
            />
            
            <div className="flex items-center gap-1 mb-0.5 ml-2 border-l border-gray-300 pl-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-green-600 hover:bg-gray-200 rounded-full transition-colors"
                title="Add Photo"
              >
                 <ImageIcon size={18} />
              </button>
              
              <button 
                onClick={handlePolish}
                disabled={isPolishing || !content || isPosting}
                className={`p-1.5 rounded-full transition-colors ${
                  isPolishing ? 'text-purple-400' : 'text-purple-600 hover:bg-purple-100'
                }`}
                title="AI Polish"
              >
                {isPolishing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>

          {selectedImage && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 max-w-[200px] group">
               <img src={selectedImage} alt="Selected preview" className="w-full h-auto max-h-40 object-cover" />
               <button 
                 onClick={() => setSelectedImage(null)}
                 className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <X size={14} />
               </button>
            </div>
          )}
        </div>

        <button
          onClick={handlePost}
          disabled={(!content.trim() && !selectedImage) || isPosting}
          className="bg-primary text-white p-2.5 rounded-full hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm self-end"
          title="Post Now"
        >
          {isPosting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default CreatePost;
