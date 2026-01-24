
import React, { useState } from 'react';
import { Order, OrderStatus, UserRole } from '../types';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2,
  ClipboardList,
  User,
  Calendar,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  role: UserRole;
  onAddOrder: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onDeleteOrder: (id: string) => void;
  currentUserId: string;
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  customStartDate?: string;
  onCustomStartDateChange?: (date: string) => void;
  customEndDate?: string;
  onCustomEndDateChange?: (date: string) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ 
  orders, 
  role, 
  onAddOrder, 
  onUpdateStatus, 
  onDeleteOrder,
  currentUserId,
  dateFilter,
  onDateFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => 
    o.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DRAFT:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
          <Clock size={12} /> Draft
        </span>;
      case OrderStatus.PROCESSING:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
          <CheckCircle2 size={12} /> Processing
        </span>;
      case OrderStatus.COMPLETED:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle size={12} /> Completed
        </span>;
      case OrderStatus.CANCELLED:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
          <XCircle size={12} /> Cancelled
        </span>;
    }
  };

  const canDelete = (order: Order) => {
    if (role === UserRole.ADMIN) return true;
    return order.status === OrderStatus.DRAFT;
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      // 12-hour format with AM/PM
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1">Manage and track customer entries.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Date Inputs for manual selection */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-fadeIn bg-white p-1 rounded-xl border border-gray-100">
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => onCustomStartDateChange?.(e.target.value)}
                className="bg-transparent border-none py-1.5 px-2 text-xs font-medium focus:ring-0 outline-none"
              />
              <span className="text-gray-300">-</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => onCustomEndDateChange?.(e.target.value)}
                className="bg-transparent border-none py-1.5 px-2 text-xs font-medium focus:ring-0 outline-none"
              />
            </div>
          )}

          <div className="relative">
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

          <button 
            onClick={onAddOrder}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100 text-sm lg:text-base"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Order</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer or employee..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 rounded-lg outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const dt = formatDateTime(order.createdAt);
                const deletable = canDelete(order);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        className="max-w-md text-sm font-medium text-gray-900 whitespace-pre-wrap leading-relaxed py-1"
                        dangerouslySetInnerHTML={{ __html: order.content }}
                      />
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                         <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold uppercase">
                            {order.creatorName.split(' ').map(n => n[0]).join('')}
                         </div>
                         {order.creatorName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 font-medium">{dt.date}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{dt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {role === UserRole.ADMIN && order.status === OrderStatus.DRAFT && (
                          <button 
                            onClick={() => onUpdateStatus(order.id, OrderStatus.PROCESSING)}
                            title="Mark as Processing"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        {role === UserRole.ADMIN && order.status === OrderStatus.PROCESSING && (
                          <button 
                            onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
                            title="Mark as Completed"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => deletable && onDeleteOrder(order.id)}
                          disabled={!deletable}
                          title={deletable ? "Delete Order" : "Action Restricted"}
                          className={`p-2 rounded-lg transition-all ${
                            deletable 
                            ? "text-red-500 hover:bg-red-50" 
                            : "text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => {
            const dt = formatDateTime(order.createdAt);
            const deletable = canDelete(order);
            return (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="text-sm font-semibold text-gray-900 leading-tight whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: order.content }}
                  />
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <User size={12} /> {order.creatorName}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} /> {dt.date} • {dt.time}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {role === UserRole.ADMIN && order.status === OrderStatus.DRAFT && (
                    <button 
                      onClick={() => onUpdateStatus(order.id, OrderStatus.PROCESSING)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold"
                    >
                      <CheckCircle2 size={14} /> Process
                    </button>
                  )}
                  {role === UserRole.ADMIN && order.status === OrderStatus.PROCESSING && (
                    <button 
                      onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold"
                    >
                      <CheckCircle size={14} /> Complete
                    </button>
                  )}
                  <button 
                    onClick={() => deletable && onDeleteOrder(order.id)}
                    disabled={!deletable}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold ${
                      deletable 
                      ? "bg-red-50 text-red-600" 
                      : "bg-gray-50 text-gray-300"
                    }`}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          }) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-2 text-gray-400 w-full">
    <ClipboardList size={48} className="stroke-1" />
    <p className="text-lg font-medium">No orders found</p>
    <p className="text-sm">Check your date filter or add your first order.</p>
  </div>
);

export default OrdersView;
