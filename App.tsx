
import React, { useState, useEffect } from 'react';
import { User, AppView } from './types';
import { supabase } from './services/supabaseClient';
import { mapSessionUser, signOut } from './services/authService';
import Login from './components/Login';
import Feed from './components/Feed';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import MembersList from './components/MembersList';
import EventsList from './components/EventsList';
import Avatar from './components/Avatar';
import { Loader2, Home, Users, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'events'>('feed');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(mapSessionUser(session.user));
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(mapSessionUser(session.user));
          setView(AppView.FEED);
        }
      } catch (err) {
        console.error("Auth init error", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSessionUser(session.user));
        setView(AppView.FEED);
      } else {
        setUser(null);
        setView(AppView.LOGIN);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <div className="text-4xl font-black text-primary tracking-tighter animate-pulse">clublite</div>
        <Loader2 className="w-8 h-8 text-primary animate-spin opacity-50" />
      </div>
    );
  }

  if (view === AppView.LOGIN || !user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar 
        currentUser={user} 
        onProfileClick={() => setShowProfileModal(true)} 
        onTabChange={(tab) => setActiveTab(tab)}
        activeTab={activeTab}
      />
      
      <main className="flex-1 container mx-auto px-0 sm:px-4 max-w-4xl lg:grid lg:grid-cols-12 gap-6">
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden lg:block col-span-3 py-6 sticky top-14 h-[calc(100vh-56px)]">
           <div 
             className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors mb-2"
             onClick={() => setShowProfileModal(true)}
           >
              <Avatar src={user.avatar} alt={user.name} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">{user.name}</span>
                <span className="text-[10px] text-text-secondary uppercase font-bold">Edit Profile</span>
              </div>
           </div>
           <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center gap-3 text-sm font-semibold ${activeTab === 'feed' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              >
                <Home size={20} className="text-primary" /> Feed
              </button>
              <button 
                onClick={() => setActiveTab('events')}
                className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center gap-3 text-sm font-semibold ${activeTab === 'events' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              >
                <Calendar size={20} className="text-green-500" /> Events
              </button>
              <button 
                onClick={() => setActiveTab('members')}
                className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center gap-3 text-sm font-semibold ${activeTab === 'members' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              >
                <Users size={20} className="text-blue-400" /> Members
              </button>
           </nav>
        </div>

        {/* Center Column */}
        <div className="col-span-12 lg:col-span-6">
          {activeTab === 'feed' ? (
            <Feed currentUser={user} />
          ) : activeTab === 'events' ? (
            <EventsList />
          ) : (
            <MembersList />
          )}
        </div>

        {/* Right Sidebar (Desktop Only) */}
        <div className="hidden lg:block col-span-3 py-6 sticky top-14 h-[calc(100vh-56px)]">
           <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-bold text-text-secondary uppercase text-xs tracking-widest mb-4">Upcoming Highlights</h3>
              <div className="space-y-4">
                 <div className="group cursor-pointer" onClick={() => setActiveTab('events')}>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                       <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="AI Suggestion" />
                    </div>
                    <p className="text-xs font-bold leading-tight">Join the Weekend Hiking Group!</p>
                    <p className="text-[10px] text-text-secondary mt-1">Adventure awaits you this Saturday.</p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
          onUpdate={refreshUser}
        />
      )}
    </div>
  );
};

export default App;
