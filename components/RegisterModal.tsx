
import React, { useState } from 'react';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { signUp } from '../services/authService';

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !surname || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password, firstName, surname, secretCode);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-[432px] overflow-hidden border border-border relative animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-text">Sign Up</h2>
            <p className="text-text-secondary text-[15px]">It's quick and easy.</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:bg-bg active:scale-90 rounded p-1 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-200 text-sm rounded-md text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="First name"
                className="w-1/2 bg-bg border border-border rounded-lg p-3 text-[16px] text-text focus:outline-none focus:border-primary"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Surname"
                className="w-1/2 bg-bg border border-border rounded-lg p-3 text-[16px] text-text focus:outline-none focus:border-primary"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
            
            <input
              type="email"
              placeholder="Mobile number or email address"
              className="w-full bg-bg border border-border rounded-lg p-3 text-[16px] text-text focus:outline-none focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <input
              type="password"
              placeholder="New password"
              className="w-full bg-bg border border-border rounded-lg p-3 text-[16px] text-text focus:outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="relative">
              <input
                type="text"
                placeholder="Secret Code (Optional)"
                className="w-full bg-bg border border-border rounded-lg p-3 pl-10 text-[16px] text-text focus:outline-none focus:border-primary"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
              />
              <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>

            <p className="text-[11px] text-text-secondary my-3 leading-4 text-center">
              By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
            </p>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-secondary hover:bg-secondary-hover active:scale-[0.98] text-bg font-bold text-lg px-12 py-3 rounded-lg shadow-lg transition-all min-w-[194px] flex justify-center items-center h-[52px]"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
