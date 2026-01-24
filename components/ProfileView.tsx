
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Camera, Save, User as UserIcon, Check } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdate: (name: string, profilePicture: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(name, profilePicture);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 lg:p-12 border-b border-gray-50 bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                {profilePicture ? (
                  <img src={profilePicture} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-300">
                    <UserIcon size={64} />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-110 active:scale-95"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
              <p className="text-sm text-indigo-600 font-bold uppercase tracking-widest mt-1">
                {user.role} • {user.company}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
            <input 
              required
              type="text"
              className="w-full px-6 py-4 bg-gray-50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm font-semibold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Display Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Username (Locked)</label>
            <input 
              disabled
              type="text"
              className="w-full px-6 py-4 bg-gray-100 border-gray-200 rounded-2xl outline-none text-sm font-medium text-gray-400 cursor-not-allowed"
              value={user.username}
            />
          </div>

          <button 
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
              isSaved 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            }`}
          >
            {isSaved ? (
              <>
                <Check size={20} /> Changes Saved Successfully
              </>
            ) : (
              <>
                <Save size={20} /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileView;
