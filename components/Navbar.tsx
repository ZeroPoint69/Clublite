
import React, { useState, useEffect, useRef } from 'react';
import { User, Notification, NotificationType } from '../types';
import { getNotifications, subscribeToNotifications, markNotificationsAsRead } from '../services/dataService';
import Avatar from './Avatar';
import { Home, Users, Bell, Search, Menu, Heart, MessageSquare, Plus } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onProfileClick: () => void;
  onTabChange: (tab: 'feed' | 'members') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onProfileClick, onTabChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const data = await getNotifications(currentUser.id);
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeToNotifications(currentUser.id, loadNotifications);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentUser.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await markNotificationsAsRead(currentUser.id);
      setTimeout(loadNotifications, 500);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
      case NotificationType.LIKE: return <Heart size={14} className="text-white fill-white" />;
      case NotificationType.COMMENT: return <MessageSquare size={14} className="text-white fill-white" />;
      case NotificationType.NEW_POST: return <Plus size={14} className="text-white fill-white" />;
    }
  };

  const getNotificationBg = (type: NotificationType) => {
    switch(type) {
      case NotificationType.LIKE: return 'bg-red-500';
      case NotificationType.COMMENT: return 'bg-blue-500';
      case NotificationType.NEW_POST: return 'bg-green-500';
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface shadow-sm border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-black text-primary tracking-tighter cursor-pointer" onClick={() => onTabChange('feed')}>
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

        <div className="flex items-center gap-1">
          {/* Main Navigation Tabs - Desktop Only */}
          <div className="hidden md:flex items-center gap-1 mr-2 border-r border-gray-100 pr-2">
            <button 
              onClick={() => onTabChange('feed')}
              className="p-3 text-primary hover:bg-gray-50 transition-colors h-14" title="Home"
            >
                 <Home size={24} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => onTabChange('members')}
              className="p-3 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors h-12" title="Members"
            >
                 <Users size={24} />
            </button>
          </div>
          
          {/* Right Side Section: Bell Icon + Profile Group */}
          <div className="flex items-center gap-1.5">
            {/* Notification Bell next to profile */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleBellClick}
                className={`p-2.5 rounded-full transition-colors ${showNotifications ? 'bg-gray-100 text-primary' : 'text-text-secondary hover:bg-gray-100'}`} 
                title="Notifications"
              >
                 <Bell size={24} />
                 {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface">
                     {unreadCount}
                   </span>
                 )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-text-secondary">
                        <Bell size={40} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${n.isRead ? 'border-transparent' : 'border-primary bg-primary/5'}`}>
                          <div className="relative">
                            <Avatar src={n.actorAvatar} alt={n.actorName} size="sm" />
                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${getNotificationBg(n.type)}`}>
                              {getNotificationIcon(n.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text leading-tight">
                              <span className="font-bold">{n.actorName}</span>
                              {n.type === NotificationType.LIKE && ' liked your post.'}
                              {n.type === NotificationType.COMMENT && ` commented on your post.`}
                              {n.type === NotificationType.NEW_POST && ' shared a new update.'}
                            </p>
                            <span className="text-[10px] text-text-secondary mt-1 block">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger */}
            <div 
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              onClick={onProfileClick}
            >
              <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-text leading-none">{currentUser.name}</span>
                <span className="text-[10px] text-text-secondary uppercase font-black tracking-widest">{currentUser.role}</span>
              </div>
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
            </div>

            {/* Global Menu Trigger (Desktop Only) */}
            <button className="hidden md:block p-2 text-text-secondary hover:bg-gray-100 rounded-full transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-gray-200 flex justify-around items-center h-14 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => onTabChange('feed')}
          className="flex-1 flex flex-col items-center gap-0.5 text-primary"
        >
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
          onClick={() => onTabChange('members')}
          className="flex-1 flex flex-col items-center gap-0.5 text-text-secondary"
        >
          <Users size={22} />
          <span className="text-[10px] font-medium">Club</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-0.5 text-text-secondary">
          <Search size={22} />
          <span className="text-[10px] font-medium">Search</span>
        </button>
        <button 
          onClick={onProfileClick}
          className="flex-1 flex flex-col items-center gap-0.5 text-text-secondary"
        >
          <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" className="w-5 h-5 border-none shadow-none" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
