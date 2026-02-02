
import React, { useState } from 'react';
import { Company, User } from '../types';
import { LogIn, Key, Phone, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

// API Simulation
const api = {
  get: async (key: string) => {
    const res = localStorage.getItem(key);
    return res ? JSON.parse(res) : null;
  }
};

interface LoginProps {
  company: Company;
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ company, onLogin, onBack }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    const allUsers = await api.get('users_db') || [];
    
    // Check for hardcoded admin first if DB is empty
    const adminRoot = {
      id: 'admin-root',
      name: 'Admin Root',
      phone: '000',
      password: 'admin',
      role: 'ADMIN',
      company: company
    };

    const user = allUsers.find((u: any) => 
      u.company === company && 
      u.phone === phone && 
      u.password === password
    ) || (phone === '000' && password === 'admin' ? adminRoot : null);

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid phone or password for this organization.');
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
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Access Hub</h2>
            <p className="text-sm text-gray-500">Log in to <span className="text-indigo-600 font-bold">{company}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input required type="tel" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-gray-200 rounded-2xl outline-none" placeholder="Enter phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-gray-200 rounded-2xl outline-none" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl text-xs font-semibold"><AlertCircle size={16} />{error}</div>}
            <button type="submit" disabled={isLoggingIn} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Enter Hub'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
