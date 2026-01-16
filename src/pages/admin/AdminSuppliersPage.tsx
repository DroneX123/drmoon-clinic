import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Edit2, Trash2, X, Phone, Mail, Instagram, Truck, User, MessageCircle } from 'lucide-react';

const AdminSuppliersPage: React.FC = () => {
    // Data
    const suppliers = useQuery(api.suppliers.getAll);

    // Mutations
    const createSupplier = useMutation(api.suppliers.createSupplier);
    const updateSupplier = useMutation(api.suppliers.updateSupplier);
    const deleteSupplier = useMutation(api.suppliers.deleteSupplier);

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        instagram: ''
    });

    // Handlers
    const handleOpenModal = (supplier: any = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                phone: supplier.phone,
                email: supplier.email || '',
                instagram: supplier.instagram || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                instagram: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const supplierData = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                instagram: formData.instagram || undefined,
            };

            if (editingSupplier) {
                await updateSupplier({
                    id: editingSupplier._id,
                    ...supplierData
                });
            } else {
                await createSupplier(supplierData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving supplier:", error);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
            await deleteSupplier({ id });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-2">Fournisseurs</h1>
                    <p className="text-slate-500">Gérez vos contacts et partenaires commerciaux.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-slate-900 text-gold px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nouveau Fournisseur</span>
                </button>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {!suppliers ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Chargement...</div>
                ) : suppliers.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Aucun fournisseur</h3>
                        <p className="text-slate-500">Ajoutez votre premier partenaire.</p>
                    </div>
                ) : (
                    suppliers.map((supplier: any) => (
                        <div
                            key={supplier._id}
                            onClick={() => handleOpenModal(supplier)}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-gold/50 transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 font-serif font-bold text-lg border border-slate-100">
                                    {supplier.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(supplier._id); }}
                                        className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-slate-900 mb-4">{supplier.name}</h3>

                            <div className="flex items-center gap-3 mb-6 mt-auto border-t border-slate-50 pt-4">
                                {/* Actions Bar */}
                                <a
                                    href={`tel:${supplier.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-colors"
                                    title="Appeler"
                                >
                                    <Phone className="w-5 h-5" />
                                </a>

                                <a
                                    href={`https://wa.me/${supplier.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                    title="WhatsApp"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </a>

                                {supplier.instagram && (
                                    <a
                                        href={`https://instagram.com/${supplier.instagram.replace('@', '').replace('/', '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-colors"
                                        title={`Instagram: ${supplier.instagram}`}
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}

                                {supplier.email && (
                                    <a
                                        href={`mailto:${supplier.email}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-colors ml-auto"
                                        title={supplier.email}
                                    >
                                        <Mail className="w-5 h-5" />
                                    </a>
                                )}
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
                                {editingSupplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nom du Fournisseur</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="Ex: Esthétique Pro"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="+213..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email (Optionnel)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="contact@..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Instagram (Optionnel)</label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="@..."
                                    />
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

export default AdminSuppliersPage;
