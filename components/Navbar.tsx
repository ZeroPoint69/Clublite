
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
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="text-lg font-black text-primary tracking-tighter cursor-pointer active:scale-95 transition-transform" 
            onClick={() => onTabChange('feed')}
          >
            জয়রা উজ্জ্বল সংঘ
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center gap-1 mr-2 border-r border-gray-100 pr-2">
            {[
              { id: 'feed', icon: Home, label: 'Home' },
              { id: 'events', icon: Calendar, label: 'Events' },
              { id: 'members', icon: Users, label: 'Members' }
            ].map(({ id, icon: Icon, label }) => (
              <button 
                key={id}
                onClick={() => onTabChange(id as any)}
                className={`p-3 transition-all h-14 border-b-2 active:scale-90 ${activeTab === id ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:bg-gray-50'}`} 
                title={label}
              >
                 <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleBellClick}
                className={`p-2.5 rounded-full transition-all active:scale-90 ${showNotifications ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'}`} 
                title="Notifications"
              >
                 <Bell size={24} />
                 {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                     {unreadCount}
                   </span>
                 )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <Bell size={40} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 flex gap-3 hover:bg-gray-50 cursor-pointer transition-all active:bg-gray-100 border-l-4 ${n.isRead ? 'border-transparent' : 'border-primary bg-primary/5'}`}>
                          <div className="relative shrink-0">
                            <Avatar src={n.actorAvatar} alt={n.actorName} size="sm" />
                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${getNotificationBg(n.type)}`}>
                              {getNotificationIcon(n.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-tight">
                              <span className="font-bold">{n.actorName}</span>
                              {n.type === NotificationType.LIKE && ' liked your post.'}
                              {n.type === NotificationType.COMMENT && ` commented on your post.`}
                              {n.type === NotificationType.NEW_POST && ' shared a new update.'}
                            </p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
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
              className="flex items-center gap-2 p-1 hover:bg-gray-100 active:scale-95 rounded-full cursor-pointer transition-all"
              onClick={onProfileClick}
            >
              <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-gray-800 leading-none">{currentUser.name}</span>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{currentUser.role}</span>
              </div>
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
            </div>

            <button className="hidden md:block p-2 text-gray-500 hover:bg-gray-100 active:scale-90 rounded-full transition-all">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 flex justify-around items-center h-14 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {[
          { id: 'feed', icon: Home, label: 'Home' },
          { id: 'events', icon: Calendar, label: 'Events' },
          { id: 'members', icon: Users, label: 'Club' },
          { id: 'profile', avatar: true, label: 'Profile' }
        ].map(({ id, icon: Icon, label, avatar }) => (
          <button 
            key={id}
            onClick={() => id === 'profile' ? onProfileClick() : onTabChange(id as any)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full active:scale-90 transition-all ${activeTab === id ? 'text-primary' : 'text-gray-500'}`}
          >
            {avatar ? (
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" className="w-5 h-5 border-none shadow-none" />
            ) : (
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
            )}
            <span className={`text-[10px] ${activeTab === id ? 'font-bold' : 'font-medium'}`}>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
