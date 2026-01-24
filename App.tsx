
import React, { useState, useEffect } from 'react';
import { Company, UserRole, User, Order, OrderStatus } from './types';
import Layout from './components/Layout';
import OrdersView from './components/OrdersView';
import AdminDashboard from './components/AdminDashboard';
import EmployeeManagement from './components/EmployeeManagement';
import { parseOrderText } from './services/geminiService';
import { Building2, Plus, X, Loader2, Sparkles } from 'lucide-react';

const INITIAL_EMPLOYEES: User[] = [
  { id: '1', name: 'Admin Root', username: 'admin', role: UserRole.ADMIN },
  { id: '2', name: 'Sarah Miller', username: 'sarah_m', role: UserRole.EMPLOYEE },
  { id: '3', name: 'Mike Johnson', username: 'mike_j', role: UserRole.EMPLOYEE },
];

const App: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState<'orders' | 'dashboard' | 'employees'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<User[]>(INITIAL_EMPLOYEES);
  
  // Filtering states
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Modal states
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [orderText, setOrderText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // User logic
  const currentUser = role === UserRole.ADMIN 
    ? (employees.find(e => e.role === UserRole.ADMIN) || employees[0])
    : (employees.find(e => e.role === UserRole.EMPLOYEE) || employees[0]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders_data');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    
    const savedEmployees = localStorage.getItem('employees_data');
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
  }, []);

  useEffect(() => {
    localStorage.setItem('orders_data', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('employees_data', JSON.stringify(employees));
  }, [employees]);

  const handleAddOrder = async () => {
    if (!orderText.trim()) return;
    
    setIsParsing(true);
    const parsed = await parseOrderText(orderText);
    
    // Exact formatting as requested: labels and bold tags
    const formattedContent = parsed && parsed.name 
      ? `<b>Name: </b> ${parsed.name}\n<b>Phone:</b> ${parsed.phone}\n<b>Address:</b> ${parsed.address}`
      : orderText;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      company: company!,
      content: formattedContent,
      status: OrderStatus.DRAFT,
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      createdAt: Date.now(),
    };

    setOrders([newOrder, ...orders]);
    setOrderText('');
    setShowAddOrderModal(false);
    setIsParsing(false);
  };

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const handleAddEmployee = (empData: Partial<User>) => {
    const newEmp: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: empData.name || 'Unknown',
      username: empData.username || 'user',
      role: UserRole.EMPLOYEE,
      password: empData.password,
    };
    setEmployees([...employees, newEmp]);
  };

  const handleDeleteEmployee = (id: string) => {
    if (employees.length <= 1) return;
    setEmployees(employees.filter(e => e.id !== id));
    if (role === UserRole.EMPLOYEE && !employees.find(e => e.id !== id && e.role === UserRole.EMPLOYEE)) {
       setRole(UserRole.ADMIN);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders.filter(o => o.company === company);
    const now = new Date();

    if (dateFilter === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      filtered = filtered.filter(o => o.createdAt >= todayStart);
    } else if (dateFilter === 'week') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(o => o.createdAt >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(o => o.createdAt >= monthAgo);
    } else if (dateFilter === 'year') {
      const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(o => o.createdAt >= yearAgo);
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate).getTime();
      const end = new Date(customEndDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter(o => o.createdAt >= start && o.createdAt <= end);
    }
    
    return filtered;
  };

  const activeOrders = getFilteredOrders();

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="w-full max-w-4xl space-y-8 lg:space-y-12 py-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Order<span className="text-indigo-600">Sync</span> Pro
            </h1>
            <p className="text-sm lg:text-lg text-slate-500 max-w-lg mx-auto leading-relaxed px-4">
              Select your organization to manage orders, analytics, and team collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 px-4">
            <CompanyButton 
              name={Company.RESEVALLEY} 
              color="indigo" 
              desc="Premium Estate Solutions" 
              onClick={() => setCompany(Company.RESEVALLEY)} 
            />
            <CompanyButton 
              name={Company.ROSEWORLD} 
              color="rose" 
              desc="Global Floral Logistics" 
              onClick={() => setCompany(Company.ROSEWORLD)} 
            />
          </div>
          
          <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">
            Enterprise Standard • 2024
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      company={company} 
      role={role} 
      onRoleSwitch={setRole}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onExitCompany={() => setCompany(null)}
      userName={currentUser.name}
    >
      {activeTab === 'orders' && (
        <OrdersView 
          orders={activeOrders}
          role={role}
          onAddOrder={() => setShowAddOrderModal(true)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteOrder={handleDeleteOrder}
          currentUserId={currentUser.id}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          customStartDate={customStartDate}
          onCustomStartDateChange={setCustomStartDate}
          customEndDate={customEndDate}
          onCustomEndDateChange={setCustomEndDate}
        />
      )}

      {activeTab === 'dashboard' && role === UserRole.ADMIN && (
        <AdminDashboard 
          orders={activeOrders}
          employees={employees}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          customStartDate={customStartDate}
          onCustomStartDateChange={setCustomStartDate}
          customEndDate={customEndDate}
          onCustomEndDateChange={setCustomEndDate}
        />
      )}

      {activeTab === 'employees' && role === UserRole.ADMIN && (
        <EmployeeManagement 
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />
      )}

      {/* Add Order Modal */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-5 lg:p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-gray-900">New Order Entry</h3>
                <p className="text-xs text-gray-500">Enter customer details for processing.</p>
              </div>
              <button onClick={() => setShowAddOrderModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-5 lg:p-8 space-y-6">
              <div className="relative">
                <textarea 
                  className="w-full h-48 lg:h-64 p-4 lg:p-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm leading-relaxed"
                  placeholder="Paste info here (Name, Phone, Address...)"
                  value={orderText}
                  onChange={e => setOrderText(e.target.value)}
                  disabled={isParsing}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[9px] font-bold text-indigo-500 uppercase tracking-tighter bg-white/90 px-2 py-1 rounded-lg border border-indigo-100">
                  <Sparkles size={10} /> AI Assisted
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowAddOrderModal(false)}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold order-2 sm:order-1 transition-all hover:bg-gray-200"
                  disabled={isParsing}
                >
                  Discard
                </button>
                <button 
                  onClick={handleAddOrder}
                  disabled={isParsing || !orderText.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 transition-all hover:bg-indigo-700"
                >
                  {isParsing ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {isParsing ? 'Processing AI...' : 'Add Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const CompanyButton: React.FC<{ name: string, color: string, desc: string, onClick: () => void }> = ({ name, color, desc, onClick }) => (
  <button 
    onClick={onClick}
    className="group relative bg-white p-6 lg:p-8 rounded-3xl shadow-md lg:shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-indigo-200 overflow-hidden text-center"
  >
    <div className={`w-14 h-14 lg:w-20 lg:h-20 ${color === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
      <Building2 size={32} />
    </div>
    <h2 className="text-lg lg:text-2xl font-bold text-slate-900">{name}</h2>
    <p className="text-[10px] lg:text-sm text-slate-400 mt-1">{desc}</p>
    <div className={`mt-4 w-full py-2 ${color === 'rose' ? 'bg-rose-600' : 'bg-indigo-600'} text-white rounded-full text-xs font-black shadow-lg opacity-0 lg:group-hover:opacity-100 transition-opacity`}>
      Launch Workspace
    </div>
  </button>
);

export default App;
