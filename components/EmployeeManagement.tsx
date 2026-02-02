
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Key, Phone, X, Trash2, Users, Camera, Shield, User as UserIcon } from 'lucide-react';

interface EmployeeManagementProps {
  employees: User[];
  onAddEmployee: (employee: Partial<User>) => void;
  onDeleteEmployee: (id: string) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, onAddEmployee, onDeleteEmployee }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    password: '', 
    role: UserRole.EMPLOYEE,
    profilePicture: ''
  });
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

  const setProfilePicture = (pic: string) => {
    setFormData(prev => ({ ...prev, profilePicture: pic }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee({ ...formData });
    setFormData({ name: '', phone: '', password: '', role: UserRole.EMPLOYEE, profilePicture: '' });
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
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Role & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 group transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                      {emp.profilePicture ? (
                        <img src={emp.profilePicture} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt={emp.name} />
                      ) : (
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      {emp.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 h-full">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                       }`}>
                        {emp.role}
                       </span>
                       <button 
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-gray-100">
          {employees.map((emp) => (
            <div key={emp.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {emp.profilePicture ? (
                  <img src={emp.profilePicture} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt={emp.name} />
                ) : (
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.phone}</p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  emp.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {emp.role}
                </span>
                <button onClick={() => onDeleteEmployee(emp.id)} className="text-red-400 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Register Hub Access</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {formData.profilePicture ? (
                      <img src={formData.profilePicture} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <UserIcon className="text-gray-300" size={32} />
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-md"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required type="tel" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl outline-none text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required type="password" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl outline-none text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setFormData({...formData, role: UserRole.EMPLOYEE})} className={`py-2 rounded-xl border-2 ${formData.role === UserRole.EMPLOYEE ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-400'}`}>Employee</button>
                  <button type="button" onClick={() => setFormData({...formData, role: UserRole.ADMIN})} className={`py-2 rounded-xl border-2 ${formData.role === UserRole.ADMIN ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-400'}`}>Admin</button>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg mt-4">Create Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
