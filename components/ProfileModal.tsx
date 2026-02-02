
import React, { useState } from 'react';
import { X, Loader2, Camera, RefreshCw, Check } from 'lucide-react';
import { User } from '../types';
import { updateProfile } from '../services/authService';
import Avatar from './Avatar';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRandomize = () => {
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=512`;
    setAvatar(newAvatar);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await updateProfile({ name, avatar });
      if (error) throw error;
      
      setSuccess(true);
      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-text">Edit Profile</h2>
          <button onClick={onClose} className="text-text-secondary hover:bg-gray-100 rounded-full p-1.5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-all">
                <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity pointer-events-none">
                <Camera size={24} className="text-white" />
              </div>
              <button 
                type="button"
                onClick={handleRandomize}
                className="absolute bottom-0 right-0 bg-white shadow-md border border-gray-200 p-2 rounded-full hover:bg-gray-50 text-primary transition-all"
                title="Randomize Avatar"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-text-secondary uppercase tracking-widest">Profile Picture</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-text mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-text mb-1.5">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono"
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-[10px] text-text-secondary mt-1.5">Paste a link to any image or use the randomize button above.</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-bold text-text-secondary hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className={`flex-[2] flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white transition-all shadow-md ${
                success ? 'bg-green-500 shadow-green-200' : 'bg-primary hover:bg-primary-hover shadow-primary/20'
              }`}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : success ? (
                <><Check size={20} /> Saved!</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
