
import React, { useState, useRef } from 'react';
import { X, Loader2, Camera, RefreshCw, Check, Upload, LogOut } from 'lucide-react';
import { User } from '../types';
import { updateProfile, signOut } from '../services/authService';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';

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
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRandomize = () => {
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=512`;
    setAvatar(newAvatar);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await updateProfile({ name, avatar });
      if (error) throw error;
      setSuccess(true);
      onUpdate();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    await signOut();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-text">Account Settings</h2>
            <button onClick={onClose} className="text-text-secondary hover:bg-gray-100 active:scale-90 rounded-full p-1.5 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-all">
                  <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 active:opacity-100 rounded-full transition-opacity cursor-pointer"
                >
                  <Camera size={24} className="text-white" />
                </button>
                <button 
                  type="button"
                  onClick={handleRandomize}
                  className="absolute bottom-0 right-0 bg-white shadow-md border border-gray-200 p-2 rounded-full hover:bg-gray-50 active:scale-90 text-primary transition-all"
                  title="Randomize Avatar"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
              <p className="mt-2 text-xs font-medium text-text-secondary uppercase tracking-widest">Profile Picture</p>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Your full name"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || success || loggingOut}
                className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white transition-all shadow-md active:scale-[0.98] ${
                  success ? 'bg-green-500 shadow-green-200' : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                }`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : success ? <><Check size={20} /> Saved!</> : 'Save Changes'}
              </button>

              <div className="border-t border-gray-100 my-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={loggingOut}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all border border-red-200 shadow-sm"
                >
                  {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <><LogOut size={18} /> Sign Out</>}
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-text-secondary text-sm font-medium hover:underline active:opacity-60 transition-all py-2"
              >
                Back to Club
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={showLogoutConfirm}
        title="Sign Out?"
        message="Are you sure you want to log out of your ClubLite account?"
        confirmLabel="Logout"
        onConfirm={onConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default ProfileModal;
