import React, { useState, useEffect } from 'react';
import { User, AppView } from './types';
import { supabase } from './services/supabaseClient';
import { mapSessionUser, signOut } from './services/authService';
import Login from './components/Login';
import Feed from './components/Feed';
import Navbar from './components/Navbar';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSessionUser(session.user));
        setView(AppView.FEED);
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const handleLogout = async () => {
    await signOut();
    // State update handled by onAuthStateChange
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (view === AppView.LOGIN || !user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar currentUser={user} onLogout={handleLogout} />
      <main className="container mx-auto px-0 md:px-4">
        <Feed currentUser={user} />
      </main>
    </div>
  );
};

export default App;
