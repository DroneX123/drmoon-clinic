import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Edit2, Trash2, X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

const AdminExpensesPage: React.FC = () => {
    // Data
    const expenses = useQuery(api.expenses.getAll);

    // Mutations
    const createExpense = useMutation(api.expenses.createExpense);
    const updateExpense = useMutation(api.expenses.updateExpense);
    const deleteExpense = useMutation(api.expenses.deleteExpense);

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);

    // Helper for default date (Today YYYY-MM-DD)
    const getToday = () => new Date().toISOString().split('T')[0];

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        date: getToday(),
        category: 'Autre'
    });

    const categories = ["Loyer", "Électricité/Eau", "Matériel", "Marketing", "Salaires", "Maintenance", "Autre"];

    // Handlers
    const handleOpenModal = (expense: any = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                title: expense.title,
                amount: expense.amount.toString(),
                date: expense.date,
                category: expense.category
            });
        } else {
            setEditingExpense(null);
            setFormData({
                title: '',
                amount: '',
                date: getToday(),
                category: 'Autre'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.amount || !formData.date) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            const expenseData = {
                title: formData.title,
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: formData.category,
            };

            if (editingExpense) {
                await updateExpense({
                    id: editingExpense._id,
                    ...expenseData
                });
            } else {
                await createExpense(expenseData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving expense:", error);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
            await deleteExpense({ id });
        }
    };

    // Calculate Total
    const totalExpenses = expenses?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-2">Dépenses</h1>
                    <p className="text-slate-500">Suivi des coûts et charges.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-red-400">Total</span>
                        <span className="font-serif text-xl font-bold text-red-600">{totalExpenses.toLocaleString()} DA</span>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-slate-900 text-gold px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nouvelle Dépense</span>
                    </button>
                </div>
            </div>

            {/* Expenses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {!expenses ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Chargement...</div>
                ) : expenses.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Aucune dépense</h3>
                        <p className="text-slate-500">Ajoutez vos charges ici.</p>
                    </div>
                ) : (
                    expenses.map((expense: any) => (
                        <div
                            key={expense._id}
                            onClick={() => handleOpenModal(expense)}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-gold/50 transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                                    {expense.category}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(expense._id); }}
                                        className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-slate-900 mb-1">{expense.title}</h3>
                            <p className="font-serif text-xl font-bold text-red-600 mb-4">
                                - {expense.amount.toLocaleString()} DA
                            </p>

                            <div className="flex items-center gap-2 mt-auto text-sm text-slate-400 border-t border-slate-50 pt-4">
                                <Calendar className="w-4 h-4" />
                                <span>{expense.date}</span>
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
                                {editingExpense ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Titre / Libellé</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="Ex: Facture Électricité"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Montant (DA)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Catégorie</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold appearance-none cursor-pointer"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
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

export default AdminExpensesPage;
