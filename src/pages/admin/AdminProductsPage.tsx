import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Edit2, Trash2, X, Package, DollarSign, Box } from 'lucide-react';

const AdminProductsPage: React.FC = () => {
    // Data
    const products = useQuery(api.products.getAll);
    const suppliers = useQuery(api.suppliers.getAll);

    // Mutations
    const createProduct = useMutation(api.products.createProduct);
    const updateProduct = useMutation(api.products.updateProduct);
    const deleteProduct = useMutation(api.products.deleteProduct);
    const createExpense = useMutation(api.expenses.createExpense);

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        stock_quantity: '',
        buy_price: '',
        selling_price: '',
        supplier_id: ''
    });

    // Handlers
    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                stock_quantity: product.stock_quantity.toString(),
                buy_price: product.buy_price.toString(),
                selling_price: product.selling_price?.toString() || '',
                supplier_id: product.supplier_id
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                stock_quantity: '0',
                buy_price: '',
                selling_price: '',
                supplier_id: suppliers && suppliers.length > 0 ? suppliers[0]._id : ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.supplier_id) {
                alert("Veuillez sélectionner un fournisseur (ou en créer un via seed)");
                return;
            }

            const newStock = Number(formData.stock_quantity);
            const buyPrice = Number(formData.buy_price);

            const productData = {
                name: formData.name,
                stock_quantity: newStock,
                buy_price: buyPrice,
                selling_price: formData.selling_price ? Number(formData.selling_price) : undefined,
                supplier_id: formData.supplier_id as any,
            };

            // AUTOMATIC EXPENSE LOGIC
            // Always create expense if stock is added
            let quantityAdded = 0;
            if (editingProduct) {
                quantityAdded = newStock - editingProduct.stock_quantity;
            } else {
                quantityAdded = newStock;
            }

            if (quantityAdded > 0) {
                const expenseAmount = quantityAdded * buyPrice;
                await createExpense({
                    title: `Achat Stock: ${formData.name}`,
                    amount: expenseAmount,
                    date: new Date().toISOString().split('T')[0],
                    category: "Stock"
                });
            }

            if (editingProduct) {
                await updateProduct({
                    id: editingProduct._id,
                    ...productData
                });
            } else {
                await createProduct(productData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            await deleteProduct({ id });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-2">Gestion des Produits</h1>
                    <p className="text-slate-500">Gérez le stock et les prix des produits utilisés.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-slate-900 text-gold px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nouveau Produit</span>
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {!products ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Chargement...</div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Aucun produit</h3>
                        <p className="text-slate-500">Ajoutez votre premier produit au stock.</p>
                    </div>
                ) : (
                    products.map((product: any) => (
                        <div
                            key={product._id}
                            onClick={() => handleOpenModal(product)}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-gold/50 transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Stock</p>
                                    <p className={`font-bold text-lg ${product.stock_quantity < 10 ? 'text-red-500' : 'text-slate-900'}`}>
                                        {product.stock_quantity}
                                    </p>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-slate-900 mb-1">{product.name}</h3>
                            <p className="text-xs text-slate-400 mb-6 font-mono truncate">ID: {product._id}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase text-slate-400">Prix Achat</span>
                                    <span className="font-serif font-bold text-slate-700">{product.buy_price.toLocaleString()} DA</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }}
                                        className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-slate-50 text-slate-300 hover:text-slate-900 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-serif text-slate-900">
                                {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nom du Produit</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="Ex: Toxine Botulique"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Quantité (Stock)</label>
                                    <div className="relative">
                                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={formData.stock_quantity}
                                            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Fournisseur</label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold appearance-none"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {suppliers?.map((s: any) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Prix Achat (DA)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">DA</span>
                                        <input
                                            type="number"
                                            value={formData.buy_price}
                                            onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                {/* Selling Price Removed as per request */}
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-slate-900 text-gold rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg mt-4"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;
