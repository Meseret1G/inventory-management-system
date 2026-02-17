import React, { useState, useEffect } from "react";
import api from "../api";
import { Trash2, Edit2, Plus, X, Loader2, Search, Layers } from "lucide-react";

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCatName, setNewCatName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [categorySearch, setCategorySearch] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories/");
            const data = response.data.results || response.data;
            setCategories(Array.isArray(data) ? data : []);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to fetch categories");
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingId) {
                await api.patch(`/categories/${editingId}/`, { name: newCatName });
            } else {
                await api.post("/categories/", { name: newCatName });
            }
            setNewCatName("");
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            setError("Failed to save category. It might already exist.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? Products assigned to this category may lose their association.")) {
            try {
                await api.delete(`/categories/${id}/`);
                fetchCategories();
            } catch (err) {
                alert("Failed to delete category.");
            }
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 animate-pulse">
            <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
            <p className="text-gray-500 font-medium">Synchronizing Categories...</p>
        </div>
    );

    return (
        /* MAIN WRAPPER WITH ENTRANCE ANIMATION */
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
            
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Layers size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Categories</h2>
                </div>
                <span className="text-xs font-bold bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 border border-indigo-100">
                    {categories.length} Total
                </span>
            </div>
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2 animate-in zoom-in duration-300">
                    <X size={16} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Create/Edit Form */}
            <form onSubmit={handleSave} className="flex gap-2 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                <input 
                    type="text"
                    className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all font-medium"
                    placeholder={editingId ? "Update category name..." : "Enter new category name..."}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                    className={`${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 font-bold shadow-md`}
                >
                    {editingId ? <Edit2 size={18}/> : <Plus size={18}/>}
                    {editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                    <button 
                        type="button" 
                        onClick={() => {setEditingId(null); setNewCatName('');}} 
                        className="bg-gray-200 p-3 rounded-xl hover:bg-gray-300 text-gray-600 transition-colors"
                    >
                        <X size={20}/>
                    </button>
                )}
            </form>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-sm"
                    placeholder="Search existing categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                />
            </div>

            {/* Categories List with subtle staggered entrance effect via CSS */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 animate-in fade-in duration-700">
                        {categorySearch ? `No categories match "${categorySearch}"` : "Your category list is currently empty."}
                    </div>
                ) : (
                    filteredCategories.map((cat, index) => (
                        <div 
                            key={cat.id} 
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="flex justify-between items-center p-4 bg-white rounded-xl group hover:bg-indigo-50/50 hover:shadow-md border border-gray-100 hover:border-indigo-200 transition-all animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both"
                        >
                            <span className="font-bold text-gray-700 group-hover:text-indigo-700 transition-colors">{cat.name}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <button 
                                    onClick={() => {
                                        setEditingId(cat.id); 
                                        setNewCatName(cat.name);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="p-2 text-indigo-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-indigo-100 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 text-red-500 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CategoryManager;