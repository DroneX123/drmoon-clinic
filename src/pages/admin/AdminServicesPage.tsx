import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Edit2, Trash2, X, Sparkles, Tag, Clock, AlignLeft } from 'lucide-react';

const AdminServicesPage: React.FC = () => {
    // Data
    const allServices = useQuery(api.services.getAllServices);

    // Mutations
    const createService = useMutation(api.services.createService);
    const updateService = useMutation(api.services.updateService);
    const deleteService = useMutation(api.services.deleteService);

    // State
    const [selectedCategory, setSelectedCategory] = useState('Visage');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Visage',
        price: '',
        description: '',
        duration_minutes: '30'
    });

    // Categories
    const categories = [
        { id: 'Visage', label: 'Visage' },
        { id: 'Corps', label: 'Corps' },
        { id: 'Peau', label: 'Soins Peau' },
    ];

    // Filtered Services
    const filteredServices = allServices?.filter((s: any) => s.category === selectedCategory);

    // Handlers
    const handleOpenModal = (service: any = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                category: service.category,
                price: service.price.toString(),
                description: service.description || '',
                duration_minutes: service.duration_minutes.toString()
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                category: selectedCategory,
                price: '',
                description: '',
                duration_minutes: '30'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const serviceData = {
                name: formData.name,
                category: formData.category,
                price: Number(formData.price),
                description: formData.description,
                duration_minutes: Number(formData.duration_minutes),
            };

            if (editingService) {
                await updateService({
                    id: editingService._id,
                    ...serviceData
                });
            } else {
                await createService(serviceData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving service:", error);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
            await deleteService({ id });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-2">Offres & Services</h1>
                    <p className="text-slate-500">Gérez les prestations proposées à vos clients.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-slate-900 text-gold px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nouveau Service</span>
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${selectedCategory === cat.id
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {!filteredServices ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Chargement...</div>
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Aucun service</h3>
                        <p className="text-slate-500">Ajoutez votre premier service dans cette catégorie.</p>
                    </div>
                ) : (
                    filteredServices.map((service: any) => (
                        <div
                            key={service._id}
                            onClick={() => handleOpenModal(service)}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-gold/50 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-serif font-bold text-lg text-slate-900">{service.price.toLocaleString()} DA</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-slate-900 mb-2">{service.name}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 line-clamp-3">
                                {service.description || "Aucune description"}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {service.duration_minutes} min
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(service._id); }}
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
                                {editingService ? 'Modifier le Service' : 'Nouveau Service'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nom du Service</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="Ex: Soin Hydrafacial"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Catégorie</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold appearance-none"
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Durée (min)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={formData.duration_minutes}
                                            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Prix (DA)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gold text-sm">DA</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold min-h-[100px]"
                                        placeholder="Description détaillée du soin..."
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

export default AdminServicesPage;
