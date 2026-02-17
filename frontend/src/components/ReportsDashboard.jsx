import React, { useEffect, useState } from 'react';
import api from '../api';
import { Loader2, DollarSign, Package, TrendingUp, BarChart3, AlertTriangle, PieChart, Layers, X } from 'lucide-react';

const ReportsDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products/'),
                    api.get('/categories/')
                ]);
                setProducts(prodRes.data.results || prodRes.data);
                setCategories(catRes.data.results || catRes.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch dashboard data");
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // --- CALCULATIONS ---
    const totalValue = products.reduce((acc, p) => acc + (Number(p.price) * p.quantity), 0);
    const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
    const lowStockCount = products.filter(p => p.quantity <= (p.low_stock_threshold || 5)).length;
    const totalCategoriesCount = categories.length;

    // --- CATEGORY AGGREGATION ---
    const categoryData = products.reduce((acc, p) => {
        const categoryMatch = categories.find(c => c.id === p.category);
        const name = categoryMatch ? categoryMatch.name : (p.category_name || "Uncategorized");

        if (!acc[name]) acc[name] = { value: 0, count: 0, lowStockItems: 0 };
        
        const price = parseFloat(p.price) || 0;
        acc[name].value += (price * p.quantity);
        acc[name].count += p.quantity;
        
        if (p.quantity <= (p.low_stock_threshold || 5)) {
            acc[name].lowStockItems += 1;
        }
        
        return acc;
    }, {});

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-gray-500 font-medium">Generating Financial Reports...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* HEADER */}
            <header className="flex justify-between items-end">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700 ease-out">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2  text-amber-600 rounded-lg animate-bounce-subtle">
                    <BarChart3 size={24} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Inventory Analytics
                    </h1>
                </div>
                <p className="text-gray-500 ml-[44px]"> 
                    Real-time financial status of your assets.
                </p>
                </div>
                <div className="text-right hidden md:block border-l-2 border-gray-100 pl-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Sync</p>
                    <p className="text-sm font-medium text-gray-600">{new Date().toLocaleTimeString()}</p>
                </div>
            </header>

            {/* ERROR HANDLING */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p className="font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X size={18}/></button>
                </div>
            )}

            {/* TOP LEVEL METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
                            <DollarSign size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Total Value</p>
                        <h2 className="text-2xl font-black text-gray-900">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit">
                            <Package size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Units</p>
                        <h2 className="text-2xl font-black text-gray-900">{totalItems.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                            <Layers size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Categories</p>
                        <h2 className="text-2xl font-black text-gray-900">{totalCategoriesCount}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg w-fit">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Low Stock</p>
                        <h2 className="text-2xl font-black text-gray-900">{lowStockCount}</h2>
                    </div>
                </div>
            </div>

            {/* CATEGORY BREAKDOWN TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PieChart className="text-indigo-500" size={20} />
                        <h3 className="font-bold text-gray-800 text-lg">Inventory Distribution</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Financial Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {Object.entries(categoryData).map(([name, data]) => (
                                <tr key={name} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700">{name}</span>
                                            {data.lowStockItems > 0 && (
                                                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                                                    <AlertTriangle size={10} /> {data.lowStockItems} Items Low
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">{data.count.toLocaleString()} units</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                                        ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;