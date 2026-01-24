
import React, { useState } from 'react';
import { UserRole, Company, User } from '../types';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  LogOut, 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  UserCircle, 
  Menu, 
  X,
  User as UserIcon,
  Package
} from 'lucide-react';

interface LayoutProps {
  company: Company;
  role: UserRole;
  activeTab: 'dashboard' | 'products' | 'orders' | 'employees' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'employees' | 'profile') => void;
  onLogout: () => void;
  user: User;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  company, 
  role, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  user, 
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
    { id: 'products', label: 'Products', icon: Package, roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { id: 'orders', label: 'Orders', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { id: 'employees', label: 'Employees', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'profile', label: 'Profile', icon: UserIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">OrderSync</h1>
            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">{company}</p>
          </div>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {filteredNavItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as any);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform 
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span>{company}</span>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-medium capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-all"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{role}</p>
              </div>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-indigo-100" />
              ) : (
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700">
                  {role === UserRole.ADMIN ? <ShieldCheck size={18} /> : <UserCircle size={18} />}
                </div>
              )}
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-2 animate-fadeIn">
                  <button onClick={() => { setActiveTab('profile'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <UserIcon size={16} /> Profile Settings
                  </button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
