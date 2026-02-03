
import React, { useState } from 'react';
import { Company, User } from '../types';
import { supabase } from '../services/supabaseClient';
import { LogIn, Key, User as UserIcon, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  company: Company;
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ company, onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    const { data, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('company', company)
      .eq('username', username.toLowerCase())
      .eq('password', password)
      .single();

    if (data && !dbError) {
      onLogin({
        ...data,
        profilePicture: data.profile_picture
      });
    } else {
      setError('Invalid username or password for this organization.');
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slideUp">
        <div className="p-8 lg:p-10">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-8 text-sm font-medium">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="space-y-2 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-100">
              <LogIn size={24} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-gray-500">Log in to <span className="text-indigo-600 font-bold">{company}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-gray-200 rounded-2xl outline-none" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-gray-200 rounded-2xl outline-none" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl text-xs font-semibold animate-shake"><AlertCircle size={16} />{error}</div>}
            <button type="submit" disabled={isLoggingIn} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
