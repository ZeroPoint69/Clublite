
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
        setError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে");
      }
    } catch (err) {
      setError("একটি সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[980px] flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0 pb-20 md:pb-0">
        
        <div className="w-full md:w-[500px] text-center md:text-left -mt-10 md:mt-0">
          <h1 className="text-primary text-4xl md:text-[52px] font-bold tracking-tighter mb-4 md:-ml-1">
            জয়রা উজ্জ্বল সংঘ
          </h1>
          <h2 className="text-[#1c1e21] text-2xl md:text-[28px] leading-8 font-normal">
            আমাদের সংঘের সকল কার্যক্রম এবং বন্ধুদের সাথে যুক্ত থাকুন।
          </h2>
        </div>

        <div className="w-full md:w-[396px] flex flex-col items-center">
          <div className="bg-white p-4 rounded-[8px] shadow-lg w-full flex flex-col gap-3">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <input
                type="text"
                placeholder="ইমেইল অথবা মোবাইল নম্বর"
                className="w-full border border-gray-300 rounded-[6px] px-[16px] py-[14px] text-[17px] text-[#1c1e21] bg-white focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_#e7f3ff] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="পাসওয়ার্ড"
                className="w-full border border-gray-300 rounded-[6px] px-[16px] py-[14px] text-[17px] text-[#1c1e21] bg-white focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_#e7f3ff] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.98] text-white text-[20px] font-bold rounded-[6px] w-full h-[48px] transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'লগ ইন'}
              </button>
            </form>

            <a href="#" className="text-[#1877f2] text-[14px] text-center hover:underline mt-1 active:opacity-70 transition-opacity">
              পাসওয়ার্ড ভুলে গেছেন?
            </a>

            <div className="border-b border-gray-300 my-2"></div>

            <div className="flex justify-center pb-2">
              <button
                onClick={() => setShowRegister(true)}
                className="bg-[#42b72a] hover:bg-[#36a420] active:scale-95 text-white text-[17px] font-bold px-[16px] h-[48px] rounded-[6px] transition-all"
              >
                নতুন অ্যাকাউন্ট তৈরি করুন
              </button>
            </div>
          </div>
          
          <div className="mt-7 text-center">
            <p className="text-[14px] text-[#1c1e21] font-medium italic">
              জয়রা, মানিকগঞ্জ, বাংলাদেশ ।
            </p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 w-full p-4 text-center text-xs text-gray-500 bg-white md:bg-transparent">
        <div className="max-w-[980px] mx-auto border-t border-gray-300 pt-4 md:border-none">
           জয়রা উজ্জ্বল সংঘ © 2026
        </div>
      </footer>

      {showRegister && (
        <RegisterModal 
          onClose={() => setShowRegister(false)} 
          onSuccess={() => {
            setShowRegister(false);
            setError("অ্যাকাউন্ট তৈরি হয়েছে! এখন লগ ইন করুন।");
          }}
        />
      )}
    </div>
  );
};

export default Login;
