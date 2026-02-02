
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
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-bg/90 backdrop-blur-md p-4">
        <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border animate-in zoom-in-95 duration-300">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-bg/30">
            <h2 className="text-xl font-bold text-text">Account Settings</h2>
            <button onClick={onClose} className="text-text-secondary hover:bg-bg active:scale-90 rounded-full p-2 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/50 shadow-2xl transition-all duration-300">
                  <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-bg/40 opacity-0 group-hover:opacity-100 active:opacity-100 rounded-full transition-opacity cursor-pointer backdrop-blur-sm"
                >
                  <Camera size={28} className="text-white drop-shadow-lg" />
                </button>
                <button 
                  type="button"
                  onClick={handleRandomize}
                  className="absolute bottom-0 right-0 bg-surface shadow-xl border border-border p-2.5 rounded-full hover:bg-bg active:scale-90 text-primary transition-all"
                  title="Randomize Avatar"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <p className="mt-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Profile Identity</p>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text"
                  placeholder="Your full name"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || success || loggingOut}
                className={`w-full flex justify-center items-center gap-3 px-4 py-4 rounded-xl font-bold text-bg transition-all shadow-xl active:scale-[0.98] ${
                  success ? 'bg-secondary' : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                }`}
              >
                {loading ? <Loader2 size={22} className="animate-spin" /> : success ? <><Check size={22} /> Changes Saved!</> : 'Save Profile'}
              </button>

              <div className="border-t border-border my-6 pt-6">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={loggingOut}
                  className="w-full flex justify-center items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-red-400 bg-red-900/10 hover:bg-red-900/20 active:scale-[0.98] transition-all border border-red-900/30 shadow-sm"
                >
                  {loggingOut ? <Loader2 size={20} className="animate-spin" /> : <><LogOut size={20} /> Sign Out</>}
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-text-secondary text-xs font-black uppercase tracking-widest hover:text-text active:opacity-60 transition-all py-2"
              >
                Return to সংঘ
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={showLogoutConfirm}
        title="Sign Out?"
        message="Are you sure you want to log out of your জয়রা উজ্জ্বল সংঘ account?"
        confirmLabel="Logout"
        onConfirm={onConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default ProfileModal;
