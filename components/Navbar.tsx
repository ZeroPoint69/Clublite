import React from 'react';
import { User } from '../types';
import Avatar from './Avatar';
import { LogOut, Home, Users, Bell } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-surface shadow-sm border-b border-gray-200 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold text-primary tracking-tight">
          club<span className="font-light">lite</span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-6">
        {/* Mobile/Desktop Icons */}
        <button className="p-2 text-primary rounded-lg hover:bg-gray-100">
             <Home size={24} strokeWidth={2.5} />
        </button>
        <button className="p-2 text-text-secondary rounded-lg hover:bg-gray-100 hidden md:block">
             <Users size={24} />
        </button>
        <button className="p-2 text-text-secondary rounded-lg hover:bg-gray-100 hidden md:block">
             <Bell size={24} />
        </button>
        
        {/* User Menu */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
           <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-text leading-none">{currentUser.name}</span>
                <span className="text-[10px] text-text-secondary uppercase">{currentUser.role}</span>
           </div>
           <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
           <button 
             onClick={onLogout}
             className="ml-2 p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
             title="Logout"
           >
             <LogOut size={20} />
           </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;