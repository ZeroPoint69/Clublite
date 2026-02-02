
import React, { useState, useEffect, useRef } from 'react';
import { User, Notification, NotificationType } from '../types';
import { getNotifications, subscribeToNotifications, markNotificationsAsRead } from '../services/dataService';
import Avatar from './Avatar';
import { Home, Users, Bell, Menu, Heart, MessageSquare, Plus, Calendar } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onProfileClick: () => void;
  onTabChange: (tab: 'feed' | 'members' | 'events') => void;
  activeTab: 'feed' | 'members' | 'events';
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onProfileClick, onTabChange, activeTab }) => {
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
        </div>

        <div className="flex items-center gap-1">
          {/* Main Navigation Tabs - Desktop Only */}
          <div className="hidden md:flex items-center gap-1 mr-2 border-r border-gray-100 pr-2">
            <button 
              onClick={() => onTabChange('feed')}
              className={`p-3 transition-colors h-14 border-b-2 ${activeTab === 'feed' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:bg-gray-50'}`} title="Home"
            >
                 <Home size={24} strokeWidth={activeTab === 'feed' ? 2.5 : 2} />
            </button>
            <button 
              onClick={() => onTabChange('events')}
              className={`p-3 transition-colors h-14 border-b-2 ${activeTab === 'events' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:bg-gray-50'}`} title="Events"
            >
                 <Calendar size={24} strokeWidth={activeTab === 'events' ? 2.5 : 2} />
            </button>
            <button 
              onClick={() => onTabChange('members')}
              className={`p-3 transition-colors h-14 border-b-2 ${activeTab === 'members' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:bg-gray-50'}`} title="Members"
            >
                 <Users size={24} strokeWidth={activeTab === 'members' ? 2.5 : 2} />
            </button>
          </div>
          
          {/* Right Side Section: Bell Icon + Profile Group */}
          <div className="flex items-center gap-1.5">
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
          className={`flex-1 flex flex-col items-center gap-0.5 ${activeTab === 'feed' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <Home size={22} strokeWidth={activeTab === 'feed' ? 2.5 : 2} />
          <span className={`text-[10px] ${activeTab === 'feed' ? 'font-bold' : 'font-medium'}`}>Home</span>
        </button>
        <button 
          onClick={() => onTabChange('events')}
          className={`flex-1 flex flex-col items-center gap-0.5 ${activeTab === 'events' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <Calendar size={22} strokeWidth={activeTab === 'events' ? 2.5 : 2} />
          <span className={`text-[10px] ${activeTab === 'events' ? 'font-bold' : 'font-medium'}`}>Events</span>
        </button>
        <button 
          onClick={() => onTabChange('members')}
          className={`flex-1 flex flex-col items-center gap-0.5 ${activeTab === 'members' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <Users size={22} strokeWidth={activeTab === 'members' ? 2.5 : 2} />
          <span className={`text-[10px] ${activeTab === 'members' ? 'font-bold' : 'font-medium'}`}>Club</span>
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
