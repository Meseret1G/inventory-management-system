import React, { useEffect, useState } from 'react';
import Login from './Login';
import ProductList from './components/ProductList';
import CategoryManager from './components/CategoryManager';
import ReportsDashboard from './components/ReportsDashboard'; 
import api from './api'; 
import { LayoutDashboard, Package, LogOut, BarChart3, Plus, X, Layers } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [error, setError] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentView, setCurrentView] = useState('inventory'); 

  const [formData, setFormData] = useState({
      name: '',
      sku: '', 
      description: '',
      quantity: '',
      price: '',
      category: ''
  });
  useEffect(()=>{
    if (showAddModal) {
      const fetchCategories = async () => {
        try {
          const res = await api.get('/categories/');
          const data = res.data.results || res.data;
                setCategories(Array.isArray(data) ? data : []);
        }catch(err){
          console.error("Error fetching categories:", err.response?.data || err.message);
          setError("Failed to load categories");
          setCategories([]);
        }
      }
      fetchCategories();
    }
  }, [showAddModal]);
  
  

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-800 min-h-screen">
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  const handleEditClick = (product) => {
          setEditingProduct(product);
          setFormData({
              name: product.name,
              sku: product.sku,
              description: product.description,
              quantity: product.quantity,
              price: product.price,
              category: product.category
          })
  
          setSearchTerm(product.category_name || ''); 
          setShowAddModal(true);
      }
  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  const handleCreateCategory = async () => {
    try{
      const res = await api.post('/categories/', { name: searchTerm });
      const newCategory = res.data;
      setCategories(prev => [...categories, newCategory]);
      setFormData(prev => ({ ...formData, category: newCategory.id }));
      setSearchTerm(newCategory.name);
      setIsDropdownOpen(false);
    }
    catch(err){
      console.error("Error creating category:", err.response?.data || err.message);
      setError("Failed to create category");
    }
  }
  const handleSubmit = async(e) =>{
      e.preventDefault();
      try {
          const payload = {
              ...formData,
              quantity: Number(formData.quantity),
              description: formData.description || "No description", 
              price: Number(formData.price),
              low_stock_threshold: 5
          };

          if (editingProduct) {
            await api.patch(`/products/${editingProduct.id}/`, payload);
        } else {
            await api.post('/products/', payload);
        }
          
          // Resetting everything
          setFormData({ name: '', sku: '', quantity: '', price: '' });
          setShowAddModal(false);
          setError(null);
          setRefreshTrigger(prev => prev + 1); 
      } catch (err) {
        const serverError = err.response?.data;
        setError(JSON.stringify(serverError) || "Could not add product");
        console.error("Server Error details:", serverError);
      }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Added 'fixed' and 'h-full' to prevent scrolling issues */}
      <div className="w-64 bg-slate-900 text-white p-6 space-y-8 fixed h-full flex flex-col">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="text-blue-400" /> StockMaster
        </h1>
        <div className="flex-1">
          <nav className="space-y-4">
            <button 
            onClick={() => setCurrentView('inventory')}
            className="flex items-center gap-3 bg-blue-600/10 text-blue-400 px-4 py-2 rounded-lg border border-blue-600/20 transition-colors font-medium">
              <LayoutDashboard size={20} /> Dashboard
            </button>

            <button   
    onClick={() => setCurrentView('categories')}
    className="flex items-center gap-3 bg-indigo-600/10 text-indigo-500 px-4 py-2 rounded-xl border border-indigo-600/20 hover:bg-indigo-600 hover:text-white transition-all duration-200 font-semibold shadow-sm"
>
    <Layers size={20} /> 
    <span>Categories</span>
</button>

            <button   
  onClick={() => setCurrentView('reports')}
  className="flex items-center gap-3 bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all duration-200 font-semibold shadow-sm"
>
  <BarChart3 size={20} /> 
  Reports
</button>

  
          </nav>
        </div>
        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 hover:bg-red-400/10 rounded-lg transition-all font-medium"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content - Added ml-64 because sidebar is fixed */}
      {/* Main Content - Improved with switch logic for 3 views */}
      <main className="flex-1 p-8 ml-64">
        {currentView === 'inventory' && (
          <>
            <header className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Inventory Overview</h2>
              <button 
                onClick={() => {
                  setEditingProduct(null); // Clear editing state for new product
                  setFormData({ name: '', sku: '', description: '', quantity: '', price: '', category: '' });
                  setSearchTerm('');
                  setShowAddModal(true);
                }} 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all active:scale-95 font-semibold"
              >
                <Plus size={20} /> Add Product
              </button>
            </header>
            
            <ProductList refreshTrigger={refreshTrigger} onEdit={handleEditClick} categories={categories}/>
          </>
        )}

        {currentView === 'categories' && <CategoryManager />}

        {currentView === 'reports' && <ReportsDashboard />}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            <button 
              type="button" 
              onClick={() => setShowAddModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-6">Product Entry</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 mt-1" 
                  placeholder="e.g. Wireless Mouse" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="relative">
  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
  
  {/* Search Input */}
  <input 
    type="text" 
    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 mt-1" 
    placeholder="Search or select category..." 
    value={searchTerm}
    onFocus={() => setIsDropdownOpen(true)}
    onChange={(e) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    }} 
  />

  {/* Dropdown Menu */}
  {isDropdownOpen && Array.isArray(categories) && (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
      {categories
        .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(cat => (
          <div 
            key={cat.id} 
            className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
            onClick={() => {
              setFormData({...formData, category: cat.id}); 
              setSearchTerm(cat.name); // Show the Name in the UI
              setIsDropdownOpen(false);
            }}
          >
            {cat.name}
          </div>
        ))}
      {categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
        <div className="p-3">
        <p className="text-sm text-gray-400 italic mb-2">No category found...</p>
        <button 
            type="button"
            onClick={handleCreateCategory}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        >
            + Create "{searchTerm}"
        </button>
    </div>
      )}
    </div>
  )}
</div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKU Code</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 mt-1" 
                  placeholder="PROD-001" 
                  required 
                  value={formData.sku} 
                  onChange={e => setFormData({...formData, sku: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 mt-1" 
                  placeholder="e.g. Wireless Mouse" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: e.target.value})} 
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            
            <button type="submit" className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:transform active:scale-[0.98]">
              Add to Stock
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;