
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { signIn } from '../services/authService';
import RegisterModal from './RegisterModal';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 text-text">
      <div className="w-full max-w-[980px] flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0 pb-20 md:pb-0">
        
        <div className="w-full md:w-[500px] text-center md:text-left -mt-10 md:mt-0">
          <h1 className="text-primary text-4xl md:text-[52px] font-bold tracking-tighter mb-4 md:-ml-1">
            জয়রা উজ্জ্বল সংঘ
          </h1>
          <h2 className="text-text-secondary text-2xl md:text-[28px] leading-8 font-normal">
            আমাদের সংঘের সকল কার্যক্রম এবং বন্ধুদের সাথে যুক্ত থাকুন।
          </h2>
        </div>

        <div className="w-full md:w-[396px] flex flex-col items-center">
          <div className="bg-surface p-6 rounded-xl shadow-2xl w-full flex flex-col gap-4 border border-border">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 text-sm rounded text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Email or phone number"
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-[17px] text-text focus:outline-none focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-[17px] text-text focus:outline-none focus:border-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-[20px] font-bold rounded-lg w-full h-[52px] transition-all flex items-center justify-center shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </button>
            </form>

            <a href="#" className="text-primary text-[14px] text-center hover:underline mt-1 active:opacity-70 transition-opacity">
              Forgotten password?
            </a>

            <div className="border-b border-border my-2"></div>

            <div className="flex justify-center pb-2">
              <button
                onClick={() => setShowRegister(true)}
                className="bg-secondary hover:bg-secondary-hover active:scale-95 text-bg text-[17px] font-bold px-[16px] h-[48px] rounded-lg transition-all"
              >
                Create new account
              </button>
            </div>
          </div>
          
          <div className="mt-7 text-center">
            <p className="text-[14px] text-text-secondary font-medium italic">
              জয়রা, মানিকগঞ্জ, বাংলাদেশ ।
            </p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 w-full p-4 text-center text-xs text-text-secondary">
        <div className="max-w-[980px] mx-auto border-t border-border pt-4">
           জয়রা উজ্জ্বল সংঘ © 2026
        </div>
      </footer>

      {showRegister && (
        <RegisterModal 
          onClose={() => setShowRegister(false)} 
          onSuccess={() => {
            setShowRegister(false);
            setError("Account created! Please log in.");
          }}
        />
      )}
    </div>
  );
};

export default Login;
