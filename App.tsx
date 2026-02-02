
import React, { useState, useEffect } from 'react';
import { Company, UserRole, User, Order, OrderStatus, Product, Store } from './types';
import Layout from './components/Layout';
import OrdersView from './components/OrdersView';
import AdminDashboard from './components/AdminDashboard';
import EmployeeManagement from './components/EmployeeManagement';
import ProfileView from './components/ProfileView';
import ProductsView from './components/ProductsView';
import Login from './components/Login';
import { parseOrderText } from './services/geminiService';
import { Building2, Plus, X, Loader2, Sparkles, AlertTriangle, Camera } from 'lucide-react';

// API Simulation for JSON storage
const api = {
  get: async (key: string) => {
    const res = localStorage.getItem(key);
    return res ? JSON.parse(res) : null;
  },
  save: async (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const App: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'employees' | 'profile'>('orders');
  
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [orderText, setOrderText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Deletion state
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'order' | 'employee' | 'product', id: string } | null>(null);
  
  // Store management state
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem('current_user');
      
      // Load Stores first
      let loadedStores = await api.get('stores_db');
      if (!loadedStores) {
        loadedStores = [
          { id: 's1', name: Company.RESEVALLEY, description: 'Premium Estate Solutions', color: 'indigo' },
          { id: 's2', name: Company.ROSEWORLD, description: 'Global Floral Logistics', color: 'rose' }
        ];
        await api.save('stores_db', loadedStores);
      }
      setStores(loadedStores);

      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCompany(user.company);
        setActiveTab(user.role === UserRole.ADMIN ? 'dashboard' : 'orders');
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (company) fetchData();
  }, [company]);

  const fetchData = async () => {
    const allEmps = await api.get('users_db') || [];
    setEmployees(allEmps.filter((e: any) => e.company === company));

    const allProds = await api.get('products_db') || [];
    setProducts(allProds.filter((p: any) => p.company === company));

    const allOrds = await api.get('orders_db') || [];
    setOrders(allOrds.filter((o: any) => o.company === company).sort((a: any, b: any) => b.createdAt - a.createdAt));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCompany(user.company);
    localStorage.setItem('current_user', JSON.stringify(user));
    setActiveTab(user.role === UserRole.ADMIN ? 'dashboard' : 'orders');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCompany(null);
    localStorage.removeItem('current_user');
    setActiveTab('orders');
  };

  const handleAddOrder = async () => {
    if (!orderText.trim() || !currentUser || !company) return;
    setIsParsing(true);
    const parsed = await parseOrderText(orderText);
    const formattedContent = parsed && parsed.name 
      ? `<b>Name: </b> ${parsed.name}\n<b>Phone:</b> ${parsed.phone}\n<b>Address:</b> ${parsed.address}`
      : orderText;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      company,
      content: formattedContent,
      status: OrderStatus.DRAFT,
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      createdAt: Date.now(),
    };

    const allOrds = await api.get('orders_db') || [];
    const updated = [newOrder, ...allOrds];
    await api.save('orders_db', updated);
    setOrders([newOrder, ...orders]);
    setOrderText('');
    setShowAddOrderModal(false);
    setIsParsing(false);
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    const allOrds = await api.get('orders_db') || [];
    const updated = allOrds.map((o: Order) => o.id === id ? { ...o, status } : o);
    await api.save('orders_db', updated);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    
    if (type === 'order') {
      const allOrds = await api.get('orders_db') || [];
      const updated = allOrds.filter((o: Order) => o.id !== id);
      await api.save('orders_db', updated);
      setOrders(orders.filter(o => o.id !== id));
    } else if (type === 'employee') {
      if (currentUser?.id === id) return alert("You cannot delete yourself.");
      const allEmps = await api.get('users_db') || [];
      const updated = allEmps.filter((e: User) => e.id !== id);
      await api.save('users_db', updated);
      setEmployees(employees.filter(e => e.id !== id));
    } else if (type === 'product') {
      const allProds = await api.get('products_db') || [];
      const updated = allProds.filter((p: Product) => p.id !== id);
      await api.save('products_db', updated);
      setProducts(products.filter(p => p.id !== id));
    }
    setConfirmDelete(null);
  };

  const handleAddProduct = async (productData: Partial<Product>) => {
    if (!company) return;
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      company,
      name: productData.name || '',
      category: productData.category || '',
      salePrice: productData.salePrice || 0,
      purchasePrice: productData.purchasePrice || 0,
      image: productData.image,
      description: productData.description,
    };
    const allProds = await api.get('products_db') || [];
    await api.save('products_db', [...allProds, newProduct]);
    setProducts([newProduct, ...products]);
  };

  const handleAddEmployee = async (empData: Partial<User>) => {
    if (!company) return;
    const newEmp: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: empData.name || '',
      phone: empData.phone || '',
      role: empData.role || UserRole.EMPLOYEE,
      password: empData.password,
      company,
      profilePicture: empData.profilePicture,
    };
    const allEmps = await api.get('users_db') || [];
    await api.save('users_db', [...allEmps, newEmp]);
    setEmployees([newEmp, ...employees]);
  };

  const handleSaveStore = async (storeData: Partial<Store>) => {
    let updatedStores;
    if (editingStore) {
      updatedStores = stores.map(s => s.id === editingStore.id ? { ...s, ...storeData } : s);
    } else {
      const newStore = { ...storeData, id: Math.random().toString(36).substr(2, 9) } as Store;
      updatedStores = [...stores, newStore];
    }
    await api.save('stores_db', updatedStores);
    setStores(updatedStores);
    setShowStoreModal(false);
    setEditingStore(null);
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
              Order<span className="text-indigo-600"> Hub</span>
            </h1>
            <p className="text-sm lg:text-lg text-slate-500 max-w-lg mx-auto leading-relaxed px-4">
              Select your organization to get started.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 px-4">
            {stores.map(store => (
              <div key={store.id} className="relative group">
                <CompanyButton 
                  name={store.name} 
                  color={store.color} 
                  desc={store.description} 
                  logo={store.logo}
                  onClick={() => setCompany(store.name as Company)} 
                />
              </div>
            ))}
            
            {/* Store Management for Root Admin */}
            <button 
               onClick={() => { setEditingStore(null); setShowStoreModal(true); }}
               className="bg-white border-2 border-dashed border-gray-200 p-8 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-indigo-600"
            >
              <Plus size={32} />
              <span className="font-bold">Register New Store</span>
            </button>
          </div>
        </div>

        {showStoreModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-md">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-slideUp">
               <h3 className="text-2xl font-black mb-6">Store Configuration</h3>
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const fd = new FormData(e.currentTarget);
                 handleSaveStore({
                   name: fd.get('name') as string,
                   description: fd.get('desc') as string,
                   color: 'indigo'
                 });
               }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Store Name</label>
                    <input name="name" required className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-gray-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                    <input name="desc" required className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-gray-100" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowStoreModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Register</button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!currentUser) {
    return <Login company={company} onLogin={handleLogin} onBack={() => setCompany(null)} />;
  }

  return (
    <Layout company={company} role={currentUser.role} activeTab={activeTab as any} setActiveTab={setActiveTab as any} onLogout={handleLogout} user={currentUser}>
      {activeTab === 'dashboard' && currentUser.role === UserRole.ADMIN && (
        <AdminDashboard orders={getFilteredOrders()} employees={employees} dateFilter={dateFilter} onDateFilterChange={setDateFilter} customStartDate={customStartDate} onCustomStartDateChange={setCustomStartDate} customEndDate={customEndDate} onCustomEndDateChange={setCustomEndDate} />
      )}
      {activeTab === 'products' && (
        <ProductsView products={products} role={currentUser.role} onAddProduct={handleAddProduct} onDeleteProduct={(id) => setConfirmDelete({ type: 'product', id })} />
      )}
      {activeTab === 'orders' && (
        <OrdersView orders={getFilteredOrders()} role={currentUser.role} onAddOrder={() => setShowAddOrderModal(true)} onUpdateStatus={handleUpdateStatus} onDeleteOrder={(id) => setConfirmDelete({ type: 'order', id })} currentUserId={currentUser.id} dateFilter={dateFilter} onDateFilterChange={setDateFilter} customStartDate={customStartDate} onCustomStartDateChange={setCustomStartDate} customEndDate={customEndDate} onCustomEndDateChange={setCustomEndDate} />
      )}
      {activeTab === 'employees' && currentUser.role === UserRole.ADMIN && (
        <EmployeeManagement employees={employees} onAddEmployee={handleAddEmployee} onDeleteEmployee={(id) => setConfirmDelete({ type: 'employee', id })} />
      )}
      {activeTab === 'profile' && <ProfileView user={currentUser} onUpdate={async (name, profilePicture) => {
          const allEmps = await api.get('users_db') || [];
          const updated = allEmps.map((e: User) => e.id === currentUser.id ? { ...e, name, profilePicture } : e);
          await api.save('users_db', updated);
          setCurrentUser({ ...currentUser, name, profilePicture });
      }} />}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center space-y-6 animate-slideUp">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">This action is permanent and cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-bold">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showAddOrderModal && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
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

const CompanyButton: React.FC<{ name: string, color: string, desc: string, logo?: string, onClick: () => void }> = ({ name, color, desc, logo, onClick }) => (
  <button onClick={onClick} className="w-full group relative bg-white p-6 lg:p-8 rounded-3xl shadow-md lg:shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-indigo-200 overflow-hidden text-center">
    <div className={`w-14 h-14 lg:w-20 lg:h-20 ${color === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'} rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden`}>
      {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Building2 size={32} />}
    </div>
    <h2 className="text-lg lg:text-2xl font-bold text-slate-900">{name}</h2>
    <p className="text-[10px] lg:text-sm text-slate-400 mt-1">{desc}</p>
  </button>
);

export default App;
