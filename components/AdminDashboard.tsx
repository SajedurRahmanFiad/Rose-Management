
import React from 'react';
import { Order, User, UserRole } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, Clock, ChevronDown } from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  employees: User[];
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  customStartDate?: string;
  onCustomStartDateChange?: (date: string) => void;
  customEndDate?: string;
  onCustomEndDateChange?: (date: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  orders, 
  employees, 
  dateFilter, 
  onDateFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange
}) => {
  const statsByEmployee = employees
    .filter(e => e.role === UserRole.EMPLOYEE)
    .map(emp => ({
      name: emp.name.split(' ')[0],
      fullName: emp.name,
      count: orders.filter(o => o.createdBy === emp.id).length
    }))
    .sort((a, b) => b.count - a.count);

  const totalOrders = orders.length;
  const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
  const draftOrders = orders.filter(o => o.status === 'DRAFT').length;
  
  // Count only those with Employee tag/role
  const employeeCount = employees.filter(e => e.role === UserRole.EMPLOYEE).length;

  const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Analytics Overview</h2>
         
         <div className="flex flex-wrap items-center gap-3">
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 animate-fadeIn bg-white p-1 rounded-xl border border-gray-100">
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => onCustomStartDateChange?.(e.target.value)}
                  className="bg-transparent text-gray-700 py-1.5 px-2 text-xs font-medium outline-none border-none focus:ring-0"
                />
                <span className="text-gray-300">-</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => onCustomEndDateChange?.(e.target.value)}
                  className="bg-transparent text-gray-700 py-1.5 px-2 text-xs font-medium outline-none border-none focus:ring-0"
                />
              </div>
            )}

            <div className="relative group">
              <select 
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all cursor-pointer shadow-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={<ShoppingBag size={18} className="text-indigo-600" />} 
          color="bg-indigo-50" 
        />
        <StatCard 
          title="Processing" 
          value={processingOrders} 
          icon={<TrendingUp size={18} className="text-emerald-600" />} 
          color="bg-emerald-50" 
        />
        <StatCard 
          title="In Draft" 
          value={draftOrders} 
          icon={<Clock size={18} className="text-amber-600" />} 
          color="bg-amber-50" 
        />
        <StatCard 
          title="Active Employees" 
          value={employeeCount} 
          icon={<Users size={18} className="text-blue-600" />} 
          color="bg-blue-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="mb-6">
            <h3 className="text-base lg:text-lg font-bold text-gray-900">Employee Performance</h3>
            <p className="text-xs text-gray-500">Filtered by: {dateFilter === 'custom' ? 'Custom Range' : dateFilter}</p>
          </div>
          <div className="h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsByEmployee} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                  {statsByEmployee.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4 lg:mb-6">Top Performers</h3>
          <div className="space-y-3 lg:space-y-4">
            {statsByEmployee.slice(0, 5).map((emp, i) => (
              <div key={emp.fullName} className="flex items-center justify-between p-2 lg:p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-bold ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-gray-700 truncate">{emp.fullName}</span>
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-900 flex-shrink-0">{emp.count} orders</span>
              </div>
            ))}
            {statsByEmployee.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-sm italic">No data for this period.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-3 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 lg:gap-4 hover:shadow-md transition-all">
    <div className={`w-8 h-8 lg:w-12 lg:h-12 ${color} rounded-lg lg:rounded-xl flex items-center justify-center`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] lg:text-sm text-gray-500 font-medium truncate uppercase tracking-wider">{title}</p>
      <p className="text-sm lg:text-2xl font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
