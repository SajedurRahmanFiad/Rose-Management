
import React, { useState, useEffect } from 'react';
import { Company, UserRole, User, Order, OrderStatus, Product } from './types';
import Layout from './components/Layout';
import OrdersView from './components/OrdersView';
import AdminDashboard from './components/AdminDashboard';
import EmployeeManagement from './components/EmployeeManagement';
import ProfileView from './components/ProfileView';
import ProductsView from './components/ProductsView';
import Login from './components/Login';
import { parseOrderText } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { Building2, Plus, X, Loader2, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'employees' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering states
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Modal states
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [orderText, setOrderText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem('current_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCompany(user.company);
        setActiveTab(user.role === UserRole.ADMIN ? 'dashboard' : 'products');
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (company) {
      fetchData();
    }
  }, [company]);

  const fetchData = async () => {
    if (!company) return;

    // Fetch Employees
    const { data: emps } = await supabase.from('users').select('*').eq('company', company);
    if (emps) setEmployees(emps.map(e => ({ ...e, profilePicture: e.profile_picture })));

    // Fetch Products
    const { data: prods } = await supabase.from('products').select('*').eq('company', company);
    if (prods) setProducts(prods.map(p => ({
      ...p,
      salePrice: p.sale_price,
      purchasePrice: p.purchase_price
    })));

    // Fetch Orders
    const { data: ords } = await supabase.from('orders').select('*').eq('company', company).order('created_at', { ascending: false });
    if (ords) setOrders(ords.map(o => ({
      ...o,
      creatorName: o.creator_name,
      createdAt: new Date(o.created_at).getTime()
    })));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCompany(user.company);
    localStorage.setItem('current_user', JSON.stringify(user));
    setActiveTab(user.role === UserRole.ADMIN ? 'dashboard' : 'products');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCompany(null);
    localStorage.removeItem('current_user');
    setActiveTab('orders');
  };

  const handleUpdateProfile = async (name: string, profilePicture: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('users')
      .update({ name, profile_picture: profilePicture })
      .eq('id', currentUser.id);

    if (!error) {
      setCurrentUser({ ...currentUser, name, profilePicture });
      setEmployees(employees.map(e => e.id === currentUser.id ? { ...e, name, profilePicture } : e));
    }
  };

  const handleAddOrder = async () => {
    if (!orderText.trim() || !currentUser || !company) return;
    
    setIsParsing(true);
    const parsed = await parseOrderText(orderText);
    
    const formattedContent = parsed && parsed.name 
      ? `<b>Name: </b> ${parsed.name}\n<b>Phone:</b> ${parsed.phone}\n<b>Address:</b> ${parsed.address}`
      : orderText;

    const newOrder = {
      company,
      content: formattedContent,
      status: OrderStatus.DRAFT,
      created_by: currentUser.id,
      creator_name: currentUser.name,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('orders').insert([newOrder]).select();
    
    if (!error && data) {
      setOrders([{ 
        ...data[0], 
        creatorName: data[0].creator_name, 
        createdAt: new Date(data[0].created_at).getTime() 
      }, ...orders]);
      setOrderText('');
      setShowAddOrderModal(false);
    }
    setIsParsing(false);
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleAddProduct = async (productData: Partial<Product>) => {
    if (!company) return;
    const newProduct = {
      company,
      name: productData.name,
      category: productData.category,
      sale_price: productData.salePrice,
      purchase_price: productData.purchasePrice,
      image: productData.image,
      description: productData.description,
    };

    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (!error && data) {
      setProducts([{
        ...data[0],
        salePrice: data[0].sale_price,
        purchasePrice: data[0].purchase_price
      }, ...products]);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddEmployee = async (empData: Partial<User>) => {
    if (!company) return;
    const newEmp = {
      name: empData.name,
      username: empData.username,
      role: empData.role || UserRole.EMPLOYEE,
      password: empData.password,
      company,
      profile_picture: empData.profilePicture,
    };

    const { data, error } = await supabase.from('users').insert([newEmp]).select();
    if (!error && data) {
      setEmployees([{
        ...data[0],
        profilePicture: data[0].profile_picture
      }, ...employees]);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (currentUser?.id === id) return alert("You cannot delete yourself.");
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;
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

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="w-full max-w-4xl space-y-8 lg:space-y-12 py-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Order<span className="text-indigo-600">Sync</span> Pro
            </h1>
            <p className="text-sm lg:text-lg text-slate-500 max-w-lg mx-auto leading-relaxed px-4">
              Select your organization to get started.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 px-4">
            <CompanyButton name={Company.RESEVALLEY} color="indigo" desc="Premium Estate Solutions" onClick={() => setCompany(Company.RESEVALLEY)} />
            <CompanyButton name={Company.ROSEWORLD} color="rose" desc="Global Floral Logistics" onClick={() => setCompany(Company.ROSEWORLD)} />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login company={company} onLogin={handleLogin} onBack={() => setCompany(null)} />;
  }

  return (
    <Layout company={company} role={currentUser.role} activeTab={activeTab as any} setActiveTab={setActiveTab as any} onLogout={handleLogout} user={currentUser}>
      {activeTab === 'dashboard' && currentUser.role === UserRole.ADMIN && (
        <AdminDashboard 
          orders={getFilteredOrders()} 
          employees={employees} 
          dateFilter={dateFilter} 
          onDateFilterChange={setDateFilter} 
          customStartDate={customStartDate} 
          onCustomStartDateChange={setCustomStartDate} 
          customEndDate={customEndDate} 
          onCustomEndDateChange={setCustomEndDate} 
        />
      )}
      {activeTab === 'products' && (
        <ProductsView products={products} role={currentUser.role} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />
      )}
      {activeTab === 'orders' && (
        <OrdersView 
          orders={getFilteredOrders()} 
          role={currentUser.role} 
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
      {activeTab === 'employees' && currentUser.role === UserRole.ADMIN && (
        <EmployeeManagement employees={employees} onAddEmployee={handleAddEmployee} onDeleteEmployee={handleDeleteEmployee} />
      )}
      {activeTab === 'profile' && <ProfileView user={currentUser} onUpdate={handleUpdateProfile} />}

      {showAddOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-5 lg:p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-gray-900">New Order Entry</h3>
                <p className="text-xs text-gray-500">Enter customer details for processing.</p>
              </div>
              <button onClick={() => setShowAddOrderModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-5 lg:p-8 space-y-6">
              <textarea 
                className="w-full h-48 lg:h-64 p-4 lg:p-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm"
                placeholder="Paste info here..."
                value={orderText}
                onChange={e => setOrderText(e.target.value)}
                disabled={isParsing}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setShowAddOrderModal(false)} className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold transition-all hover:bg-gray-200" disabled={isParsing}>Discard</button>
                <button onClick={handleAddOrder} disabled={isParsing || !orderText.trim()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2">
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
  <button onClick={onClick} className="group relative bg-white p-6 lg:p-8 rounded-3xl shadow-md lg:shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-indigo-200 overflow-hidden text-center">
    <div className={`w-14 h-14 lg:w-20 lg:h-20 ${color === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'} rounded-2xl flex items-center justify-center mx-auto mb-4`}><Building2 size={32} /></div>
    <h2 className="text-lg lg:text-2xl font-bold text-slate-900">{name}</h2>
    <p className="text-[10px] lg:text-sm text-slate-400 mt-1">{desc}</p>
  </button>
);

export default App;
