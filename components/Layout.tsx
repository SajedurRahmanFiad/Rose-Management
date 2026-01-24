
import React, { useState } from 'react';
import { UserRole, Company } from '../types';
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
  X 
} from 'lucide-react';

interface LayoutProps {
  company: Company;
  role: UserRole;
  onRoleSwitch: (role: UserRole) => void;
  activeTab: 'orders' | 'dashboard' | 'employees';
  setActiveTab: (tab: 'orders' | 'dashboard' | 'employees') => void;
  onExitCompany: () => void;
  userName: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  company, 
  role, 
  onRoleSwitch, 
  activeTab, 
  setActiveTab, 
  onExitCompany, 
  userName, 
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'orders', label: 'Orders', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
    { id: 'employees', label: 'Employees', icon: Users, roles: [UserRole.ADMIN] },
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
          onClick={onExitCompany}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span>Switch Company</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform 
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        {/* Header */}
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

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Debug Role Switch */}
            <div className="flex bg-gray-100 p-0.5 lg:p-1 rounded-lg">
              <button 
                onClick={() => onRoleSwitch(UserRole.ADMIN)}
                className={`px-2 lg:px-3 py-1 rounded-md text-[10px] lg:text-xs font-semibold transition-all ${role === UserRole.ADMIN ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
              >
                Admin
              </button>
              <button 
                onClick={() => onRoleSwitch(UserRole.EMPLOYEE)}
                className={`px-2 lg:px-3 py-1 rounded-md text-[10px] lg:text-xs font-semibold transition-all ${role === UserRole.EMPLOYEE ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
              >
                Employee
              </button>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">{userName}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{role}</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700">
                {role === UserRole.ADMIN ? <ShieldCheck size={18} /> : <UserCircle size={18} />}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
