import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Edit2, Trash2, X, Search, User, Phone, Mail, Instagram, Calendar, FileText, MessageCircle } from 'lucide-react';

const AdminClientsPage: React.FC = () => {
    // Data
    const clients = useQuery(api.clients.getAll);

    // Mutations
    const createClient = useMutation(api.clients.createClient);
    const updateClient = useMutation(api.clients.updateClient);
    const deleteClient = useMutation(api.clients.deleteClient);

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        instagram: '',
        notes: ''
    });

    // Filtered Clients
    const filteredClients = clients?.filter((c: any) =>
        c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    // Handlers
    const handleOpenModal = (client: any = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                first_name: client.first_name,
                last_name: client.last_name,
                phone: client.phone,
                email: client.email || '',
                instagram: client.instagram || '',
                notes: client.notes || ''
            });
        } else {
            setEditingClient(null);
            setFormData({
                first_name: '',
                last_name: '',
                phone: '',
                email: '',
                instagram: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const clientData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email || undefined,
                instagram: formData.instagram || undefined,
                notes: formData.notes || undefined,
            };

            if (editingClient) {
                await updateClient({
                    id: editingClient._id,
                    ...clientData
                });
            } else {
                await createClient(clientData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
            await deleteClient({ id });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-2">Base Clients</h1>
                    <p className="text-slate-500">Gérez votre base de données patients.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-slate-900 text-gold px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nouveau Client</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher par nom, téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all font-medium text-slate-900"
                />
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {!filteredClients ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Chargement...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Aucun client trouvé</h3>
                        <p className="text-slate-500">Essayez une autre recherche.</p>
                    </div>
                ) : (
                    filteredClients.map((client: any) => (
                        <div
                            key={client._id}
                            onClick={() => handleOpenModal(client)}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-gold/50 transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-gold font-serif font-bold text-lg">
                                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{client.first_name} {client.last_name}</h3>
                                        <p className="text-xs text-slate-400 font-mono">ID: {client._id.slice(-6)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{client.appointmentCount} RDV</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6 mt-2">
                                {/* Actions Bar */}
                                <a
                                    href={`tel:${client.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-colors"
                                    title="Appeler"
                                >
                                    <Phone className="w-5 h-5" />
                                </a>

                                <a
                                    href={`https://wa.me/${client.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                    title="WhatsApp"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </a>

                                {client.instagram && (
                                    <a
                                        href={`https://instagram.com/${client.instagram.replace('@', '').replace('/', '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-colors"
                                        title={`Instagram: ${client.instagram}`}
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}

                                {client.email && (
                                    <a
                                        href={`mailto:${client.email}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-colors ml-auto"
                                        title={client.email}
                                    >
                                        <Mail className="w-5 h-5" />
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                    {client.notes ? 'Note disponible' : 'Aucune note'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(client._id); }}
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
                                {editingClient ? 'Modifier le Client' : 'Nouveau Client'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-gold"
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
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Notes (Interne)</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-gold min-h-[100px]"
                                        placeholder="Note sur le client..."
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

export default AdminClientsPage;
