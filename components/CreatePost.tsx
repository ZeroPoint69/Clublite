
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
      alert("AI লেখা উন্নত করতে পারেনি। আবার চেষ্টা করুন।");
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="bg-white p-4 shadow-sm mb-4 border-b border-gray-200 md:rounded-lg md:border transition-all">
      <div className="flex items-start gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" className="mt-1" />
        
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 bg-gray-100 border border-gray-200 rounded-xl flex items-end px-3 py-2 focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-white focus-within:border-primary transition-all">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${currentUser.name.split(' ')[0]}, আপনার মনে কী আছে?`}
              rows={1}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-[17px] text-[#1c1e21] font-normal py-1.5 max-h-60 no-scrollbar overflow-y-auto leading-relaxed"
              disabled={isPosting}
            />
            
            <div className="flex items-center gap-1.5 mb-1 ml-2 border-l border-gray-200 pl-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:bg-gray-200 active:scale-90 rounded-full transition-all"
                title="ছবি যোগ করুন"
              >
                 <ImageIcon size={20} />
              </button>
              
              <button 
                onClick={handlePolish}
                disabled={isPolishing || !content || isPosting}
                className={`p-2 rounded-full transition-all active:scale-90 ${
                  isPolishing ? 'text-gray-400' : 'text-primary hover:bg-gray-200'
                }`}
                title="AI দিয়ে লেখা উন্নত করুন"
              >
                {isPolishing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              </button>
            </div>
          </div>

          {selectedImage && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 max-w-[240px] group shadow-sm">
               <img src={selectedImage} alt="Selected preview" className="w-full h-auto max-h-48 object-cover" />
               <button 
                 onClick={() => setSelectedImage(null)}
                 className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
               >
                 <X size={16} />
               </button>
            </div>
          )}
        </div>

        <button
          onClick={handlePost}
          disabled={(!content.trim() && !selectedImage) || isPosting}
          className="bg-primary text-white p-3 rounded-full hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 self-end flex items-center justify-center"
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
