
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Key, Mail, X, Trash2, Users } from 'lucide-react';

interface EmployeeManagementProps {
  employees: User[];
  onAddEmployee: (employee: Partial<User>) => void;
  onDeleteEmployee: (id: string) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, onAddEmployee, onDeleteEmployee }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee({ ...formData, role: UserRole.EMPLOYEE });
    setFormData({ name: '', username: '', password: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Manage employee accounts and access control.</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100 w-full sm:w-auto text-sm lg:text-base"
        >
          <UserPlus size={20} />
          Invite Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4 text-right">Role & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 group transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {emp.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 h-full">
                       {/* Role Tag on the left of delete button */}
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                       }`}>
                        {emp.role}
                       </span>
                       {emp.role !== UserRole.ADMIN ? (
                         <button 
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Employee"
                         >
                           <Trash2 size={18} />
                         </button>
                       ) : (
                         <div className="w-9 h-9" /> /* Spacer to keep alignment consistent */
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {employees.map((emp) => (
            <div key={emp.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{emp.name}</p>
                  <p className="text-xs text-gray-500">@{emp.username}</p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  emp.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {emp.role}
                </span>
                {emp.role !== UserRole.ADMIN && (
                   <button onClick={() => onDeleteEmployee(emp.id)} className="text-red-400 p-1">
                     <Trash2 size={18} />
                   </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Invite New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl outline-none text-sm" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl outline-none text-sm" placeholder="jdoe" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required type="password" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl outline-none text-sm" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg mt-4">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
