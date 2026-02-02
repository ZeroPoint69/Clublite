
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
    <div className="bg-surface p-4 shadow-lg mb-4 border-b border-border md:rounded-xl md:border transition-all">
      <div className="flex items-start gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" className="mt-1" />
        
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 bg-bg border border-border rounded-xl flex items-end px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind?`}
              rows={1}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-[16px] text-text py-1.5 max-h-40 no-scrollbar overflow-y-auto"
              disabled={isPosting}
            />
            
            <div className="flex items-center gap-1.5 mb-1 ml-2 border-l border-border pl-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-secondary hover:bg-surface active:scale-90 rounded-full transition-all"
                title="Add Photo"
              >
                 <ImageIcon size={20} />
              </button>
              
              <button 
                onClick={handlePolish}
                disabled={isPolishing || !content || isPosting}
                className={`p-2 rounded-full transition-all active:scale-90 ${
                  isPolishing ? 'text-text-secondary' : 'text-primary hover:bg-surface'
                }`}
                title="AI Polish"
              >
                {isPolishing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              </button>
            </div>
          </div>

          {selectedImage && (
            <div className="relative rounded-lg overflow-hidden border border-border max-w-[240px] group shadow-md">
               <img src={selectedImage} alt="Selected preview" className="w-full h-auto max-h-48 object-cover" />
               <button 
                 onClick={() => setSelectedImage(null)}
                 className="absolute top-2 right-2 bg-bg/80 text-text p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
               >
                 <X size={16} />
               </button>
            </div>
          )}
        </div>

        <button
          onClick={handlePost}
          disabled={(!content.trim() && !selectedImage) || isPosting}
          className="bg-primary text-white p-3 rounded-full hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 active:scale-95 self-end"
          title="Post Now"
        >
          {isPosting ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} className="ml-0.5" />}
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
