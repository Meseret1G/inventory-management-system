import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
    AlertTriangle, Trash2, Pencil, Loader2, PlusCircle, 
    MinusCircle, Search, Eye, X, FileDown, PackagePlus, 
    CheckSquare, Square, CheckCircle2 
} from 'lucide-react';

const ProductList = ({ refreshTrigger, onEdit }) => {
    const [products, setProducts] = useState([]);
    const [localCategories, setLocalCategories] = useState([]); // We will use this locally
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search and Detail States
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null); 

    // Bulk Selection States
    const [selectedId, setSelectedId] = useState([]); 
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkChange, setBulkChange] = useState(0);

    // Feedback States
    const [successMessage, setSuccessMessage] = useState(null);

    // --- FETCH DATA ---
    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setLocalCategories(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/');
            setProducts(response.data.results || response.data);
            setLoading(false);
            setError(null);
        } catch (err) {
            setError('Failed to fetch products');
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchCategories()]);
            setLoading(false);
        };
        loadAllData();
    }, [refreshTrigger]);

    // Auto-hide success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // --- SELECTION LOGIC ---
    const toggleSelect = (id) => {
        setSelectedId(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    // --- FILTER LOGIC (USING LOCAL CATEGORIES) ---
    const filteredProducts = products.filter(p => {
        const categoryMatch = localCategories.find(c => String(c.id) === String(p.category));
        
        const categoryName = categoryMatch ? categoryMatch.name : (p.category_name || "Uncategorized");
        const term = searchTerm.toLowerCase();

        return (
            (p.name?.toLowerCase().includes(term)) || 
            (p.sku?.toLowerCase().includes(term)) ||
            (categoryName.toLowerCase().includes(term))
        );
    });

    const toggleSelectAll = () => {
        if (selectedId.length === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedId([]);
        } else {
            setSelectedId(filteredProducts.map(p => p.id));
        }
    };

    // --- HANDLERS ---
    const handleBulkStockUpdate = async () => {
        try {
            await Promise.all(selectedId.map(id => api.post(`/products/${id}/adjust_stock/`, {
                quantity_change: Number(bulkChange),
                reason: bulkChange > 0 ? "Bulk Restock" : "Bulk Sale/Adjustment"
            })));

            setSuccessMessage(`Successfully updated stock for ${selectedId.length} products.`);
            setIsBulkModalOpen(false);
            setBulkChange(0);
            setSelectedId([]);
            fetchProducts();
        } catch (err) {
            setError("Failed to update stock for selected products.");
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}/`);
                fetchProducts();
            } catch (err) {
                alert("Error deleting product");
            }
        }
    };

    const handleStockChange = async (productId, change) => {
        try {
            await api.post(`/products/${productId}/adjust_stock/`, {
                quantity_change: Number(change),
                reason: change > 0 ? "Restocked" : "Sale/Adjustment"
            });
            fetchProducts(); 
        } catch (err) {
            setError('Failed to update stock');
        }
    }

    const handleExportCSV = () => {
        if (products.length === 0) {
            setError("No products to export");
            return;
        }

        const headers = ['ID', 'Name', 'SKU', 'Description', 'Category', 'Quantity', 'Price'];
        const rows = products.map(p => [
            p.id,
            `"${p.name}"`,
            p.sku,
            p.description ? `"${p.description.replace(/"/g, '""')}"` : '',
            localCategories.find(c => String(c.id) === String(p.category))?.name || 'Uncategorized',
            p.quantity,
            p.price
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="font-medium text-lg">Accessing Inventory Data...</p>
        </div>
    );

    return (
        <div className="space-y-4 relative">
            
            {successMessage && (
                <div className="fixed top-5 right-5 z-[100] bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 size={20} />
                    <span className="font-bold">{successMessage}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by name, SKU, or category..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {selectedId.length > 0 && (
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all animate-in zoom-in"
                        >
                            <PackagePlus size={20}/>
                            Update ({selectedId.length})
                        </button>
                    )}
                    
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                    >
                        <FileDown size={20} />
                        Export
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p className="font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X size={18}/></button>
                </div>
            )}

            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    {selectedId.length > 0 && selectedId.length === filteredProducts.length ? <CheckSquare className="text-indigo-600" size={22} /> : <Square size={22} />}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Level</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => {
                                const isSelected = selectedId.includes(product.id);
                                return (
                                    <tr key={product.id} className={`${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleSelect(product.id)} className="text-gray-400">
                                                {isSelected ? <CheckSquare className="text-indigo-600" size={20} /> : <Square size={20} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{product.sku}</td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleStockChange(product.id, -1)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <MinusCircle size={20} />
                                                </button>
                                                <span className="text-sm font-bold w-10 text-center text-gray-900 bg-gray-100 py-1 rounded">
                                                    {product.quantity}
                                                </span>
                                                <button onClick={() => handleStockChange(product.id, 1)} className="text-gray-400 hover:text-green-500 transition-colors">
                                                    <PlusCircle size={20} />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.quantity <= (product.low_stock_threshold || 5) ? (
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 flex items-center w-fit gap-1 border border-red-200">
                                                    <AlertTriangle size={12} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${product.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => setSelectedProduct(product)} className="text-gray-400 hover:text-gray-600 p-2"><Eye size={18} /></button>
                                                <button onClick={() => onEdit(product)} className="text-blue-400 hover:text-blue-600 p-2"><Pencil size={18} /></button>
                                                <button onClick={() => handleDelete(product.id)} className="text-gray-300 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-400 italic">
                                    No products matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODALS RENDERED BELOW (Details & Bulk) */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-200">
                        <div className="text-center space-y-4">
                            <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <PackagePlus size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Bulk Adjust</h3>
                            <div className="py-4">
                                <input 
                                    type="number" 
                                    className="w-full text-center text-3xl p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none"
                                    value={bulkChange}
                                    onChange={(e) => setBulkChange(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                                <button onClick={handleBulkStockUpdate} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold">Product Specification</h3>
                            <button onClick={() => setSelectedProduct(null)}><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Product Name</label>
                                    <p className="text-lg font-bold">{selectedProduct.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                                    <p className="text-sm font-semibold">
                                        {localCategories.find(c => String(c.id) === String(selectedProduct.category))?.name || 'Uncategorized'}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                <p className="text-gray-600 mt-2 italic">"{selectedProduct.description || 'No description provided.'}"</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end">
                            <button onClick={() => setSelectedProduct(null)} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;