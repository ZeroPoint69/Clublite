
import React, { useState } from 'react';
import { User, Post } from '../types';
import { createPost } from '../services/dataService';
import { polishText, generateClubImage } from '../services/geminiService';
import Avatar from './Avatar';
import { Sparkles, Loader2, Image as ImageIcon, Send, Wand2, X } from 'lucide-react';

interface CreatePostProps {
  currentUser: User;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser }) => {
  const [content, setContent] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !generatedImage) return;
    setIsPosting(true);

    const newPost: Post = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: content.trim() || (generatedImage ? "Shared a generated image!" : ""),
      image: generatedImage || undefined,
      timestamp: Date.now(),
      likes: [],
      commentCount: 0
    };

    try {
        await createPost(newPost);
        setContent('');
        setGeneratedImage(null);
        setShowImageGenerator(false);
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const imgData = await generateClubImage(imagePrompt);
      setGeneratedImage(imgData);
      setShowImageGenerator(false);
      setImagePrompt('');
    } catch (e) {
      alert("AI image generation failed. Try a different prompt.");
    } finally {
      setIsGeneratingImage(false);
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

      {generatedImage && (
        <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200">
           <img src={generatedImage} alt="AI Generated" className="w-full h-auto max-h-64 object-cover" />
           <button 
             onClick={() => setGeneratedImage(null)}
             className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
           >
             <X size={18} />
           </button>
        </div>
      )}

      {showImageGenerator && (
        <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in slide-in-from-top-2">
          <label className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1 block">AI Image Prompt</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="e.g. 'Club members playing volleyball at sunset'..."
              className="flex-1 bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateImage()}
            />
            <button 
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim()}
              className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Generate
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <div className="flex gap-1">
          <button 
            onClick={() => setShowImageGenerator(!showImageGenerator)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:bg-gray-100 rounded-md transition-colors text-sm font-medium ${showImageGenerator ? 'bg-gray-100' : ''}`}
          >
             <ImageIcon size={18} className="text-green-500" />
             <span className="hidden sm:inline">AI Image</span>
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
          disabled={(!content.trim() && !generatedImage) || isPosting}
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
