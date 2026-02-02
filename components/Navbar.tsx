
import React from 'react';
import { User } from '../types';
import Avatar from './Avatar';
import { LogOut, Home, Users, Bell, Search, Menu } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onProfileClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onProfileClick }) => {
  return (
    <>
      {/* Top Desktop Navbar */}
      <nav className="sticky top-0 z-50 bg-surface shadow-sm border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-black text-primary tracking-tighter cursor-pointer">
            club<span className="font-light">lite</span>
          </div>
          <div className="hidden lg:flex ml-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-text-secondary" />
            </div>
            <input 
              type="text" 
              placeholder="Search ClubLite" 
              className="bg-gray-100 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4 lg:gap-8">
          <div className="hidden md:flex items-center gap-1">
            <button className="p-3 text-primary border-b-4 border-primary rounded-none hover:bg-gray-50 transition-colors h-14" title="Home">
                 <Home size={24} strokeWidth={2.5} />
            </button>
            <button className="p-3 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors h-12" title="Members">
                 <Users size={24} />
            </button>
            <button className="p-3 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors h-12" title="Notifications">
                 <Bell size={24} />
            </button>
            <button className="p-3 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors h-12" title="Menu">
                 <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 ml-2 pl-2 md:border-l border-gray-200">
             <div className="hidden lg:flex flex-col items-end cursor-pointer" onClick={onProfileClick}>
                  <span className="text-sm font-bold text-text leading-none">{currentUser.name}</span>
                  <span className="text-[10px] text-text-secondary uppercase font-black tracking-widest">{currentUser.role}</span>
             </div>
             <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={onProfileClick}>
               <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
             </div>
             <button 
               onClick={onLogout}
               className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
               title="Logout"
             >
               <LogOut size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Bottom Mobile Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-gray-200 flex justify-around items-center h-14 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button className="flex-1 flex flex-col items-center gap-0.5 text-primary">
          <Home size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-0.5 text-text-secondary">
          <Users size={20} />
          <span className="text-[10px] font-medium">Club</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-0.5 text-text-secondary" onClick={onProfileClick}>
          <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-0.5 text-text-secondary" onClick={onLogout}>
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
