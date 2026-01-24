
import React, { useState, useRef } from 'react';
import { Product, UserRole } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Camera, 
  X, 
  Tag, 
  Info
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  role: UserRole;
  onAddProduct: (product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductsView: React.FC<ProductsViewProps> = ({ products, role, onAddProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    salePrice: 0,
    purchasePrice: 0,
    description: '',
    image: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(formData);
    setFormData({ name: '', category: '', salePrice: 0, purchasePrice: 0, description: '', image: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Inventory and catalog management.</p>
        </div>
        
        {role === UserRole.ADMIN && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100 w-full md:w-auto text-sm"
          >
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 rounded-lg outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sale / Purchase Price</th>
                {role === UserRole.ADMIN && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                          ) : (
                            <Package className="text-gray-300" size={16} />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase text-gray-500 tracking-tight">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-emerald-600">${product.salePrice}</span>
                        <span className="text-[10px] text-gray-400 font-medium">${product.purchasePrice}</span>
                      </div>
                    </td>
                    {role === UserRole.ADMIN && (
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => onDeleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === UserRole.ADMIN ? 4 : 3} className="py-20 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                    <p>No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden group relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Camera className="text-gray-300 group-hover:text-indigo-400 transition-colors" size={32} />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name</label>
                  <input required className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl outline-none text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                  <input required className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl outline-none text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                  <input className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl outline-none text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Sale Price ($)</label>
                  <input required type="number" className="w-full px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl outline-none text-sm font-bold" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Cost Price ($)</label>
                  <input required type="number" className="w-full px-4 py-3 bg-gray-50 border-gray-100 text-gray-700 rounded-xl outline-none text-sm font-bold" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 mt-4">Add to Inventory</button>
            </form>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
              ) : (
                <Package className="text-gray-200" size={80} />
              )}
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-gray-500 rounded-full shadow-lg"><X size={18} /></button>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">{selectedProduct.category}</span>
                <span className="text-xs text-gray-400 font-medium">ID: {selectedProduct.id}</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">{selectedProduct.description || "No description provided."}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Sale Price</p>
                  <p className="text-2xl font-black text-emerald-700">${selectedProduct.salePrice}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Cost</p>
                  <p className="text-2xl font-black text-gray-900">${selectedProduct.purchasePrice}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsView;
