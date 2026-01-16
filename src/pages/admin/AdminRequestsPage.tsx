import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Check, X, Calendar, Phone, MessageCircle, Instagram, Clock } from 'lucide-react';
import { groupServicesByCategory } from '../../utils/convexHelpers';

const AdminRequestsPage: React.FC = () => {
    const pendingAppointments = useQuery(api.appointments.getPending);
    const updateStatus = useMutation(api.appointments.updateStatus);
    const confirmAppointment = useMutation(api.appointments.confirmAppointment);
    const allServices = useQuery(api.services.getAllServices);

    const [phoneMenuId, setPhoneMenuId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Modal State
    const [confirmModalData, setConfirmModalData] = useState<any | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [adminNotes, setAdminNotes] = useState('');



    const handleAction = async (id: any, newStatus: string) => {
        if (newStatus === 'cancelled') {
            await updateStatus({ id, status: newStatus });
            setDeleteConfirmId(null);
        } else if (newStatus === 'confirmed') {
            const appt = pendingAppointments?.find(p => p._id === id);
            if (appt) {
                setConfirmModalData(appt);
                setNewDate(appt.date);
                setNewTime(appt.time);
                // Ensure service_ids is available, default to empty array
                const services = appt.service_ids ? appt.service_ids : (appt.services ? appt.services.map((s: any) => s._id) : []);
                setSelectedServiceIds(services);
                setAdminNotes(appt.client_message || ''); // Pre-fill with client message if any, or empty

            }
        }
    };

    const handleServiceToggle = (serviceId: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleConfirmSave = async () => {
        if (!confirmModalData) return;
        await confirmAppointment({
            id: confirmModalData._id,
            date: newDate,
            time: newTime,
            serviceIds: selectedServiceIds as any,
            adminNotes: adminNotes,
        });
        setConfirmModalData(null);
    };

    const groupedServices = allServices ? groupServicesByCategory(allServices) : [];

    if (pendingAppointments === undefined || allServices === undefined) {
        return <div className="text-slate-400 text-sm">Chargement...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-serif text-3xl text-slate-900 mb-1">Demandes de Rendez-vous</h1>
                <p className="text-slate-500 text-sm">Gérez les demandes en attente d'approbation.</p>
            </div>

            {/* Confirmation Modal */}
            {confirmModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif text-slate-900">Confirmer le Rendez-vous</h2>
                            <button onClick={() => setConfirmModalData(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                            {/* Client Summary */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                    {confirmModalData.client?.first_name?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{confirmModalData.client?.first_name} {confirmModalData.client?.last_name}</h3>
                                    <p className="text-xs text-slate-500">{confirmModalData.client?.phone}</p>
                                </div>
                            </div>

                            {/* Date & Time Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Date */}
                                <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-gold/50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase text-slate-400">Date</span>
                                        <Calendar className="w-4 h-4 text-gold" />
                                    </div>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gold/20 cursor-pointer"
                                    />
                                </div>

                                {/* Time */}
                                <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-gold/50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase text-slate-400">Heure</span>
                                        <Clock className="w-4 h-4 text-gold" />
                                    </div>
                                    <input
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gold/20 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Services Select */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gold rounded-full"></span>
                                    Services
                                </h4>
                                <div className="space-y-4">
                                    {groupedServices.map((group: any) => (
                                        <div key={group.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                                            <h5 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider">{group.title}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {group.treatments.map((svc: any) => {
                                                    const isSelected = selectedServiceIds.includes(svc._id);
                                                    return (
                                                        <button
                                                            key={svc._id}
                                                            onClick={() => handleServiceToggle(svc._id)}
                                                            className={`text-left px-3 py-2 rounded-lg text-sm border transition-all duration-200 flex items-center justify-between group
                                                                ${isSelected
                                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            <span className="font-medium">{svc.name}</span>
                                                            {isSelected && <Check className="w-3.5 h-3.5 text-gold" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
                                    Notes Internes
                                </h4>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Ajouter une note privée (ex: préférence client, allergies...)"
                                    className="w-full h-24 bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 resize-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                            <button
                                onClick={() => setConfirmModalData(null)}
                                className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                className="flex-1 px-4 py-3 rounded-xl bg-grad-gold text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Confirmer & Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {pendingAppointments.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                    <p className="text-slate-400">Aucune demande en attente.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingAppointments.map((appt) => (
                        <div key={appt._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

                            {/* Client Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-900 text-lg">
                                        {appt.client ? `${appt.client.first_name} ${appt.client.last_name}` : 'Client Inconnu'}
                                    </h3>
                                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
                                        En Attente
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-2">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-gold" />
                                        <span>{appt.date}</span>
                                    </div>
                                    {/* Time removed as requested */}

                                    {appt.client?.phone && (
                                        <div className="relative">
                                            {/* Backdrop */}
                                            {phoneMenuId === appt._id && (
                                                <div
                                                    className="fixed inset-0 z-10 cursor-default"
                                                    onClick={() => setPhoneMenuId(null)}
                                                />
                                            )}

                                            <button
                                                onClick={() => setPhoneMenuId(phoneMenuId === appt._id ? null : appt._id)}
                                                className="relative z-20 flex items-center gap-1 hover:text-slate-800 transition-colors"
                                            >
                                                <Phone className="w-4 h-4 text-gold" />
                                                <span className="underline decoration-dotted">{appt.client.phone}</span>
                                            </button>

                                            {phoneMenuId === appt._id && (
                                                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 min-w-[160px] flex flex-col gap-1 w-max">
                                                    <a
                                                        href={`tel:${appt.client.phone}`}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                        Appeler
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/${appt.client.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 text-green-600 text-xs font-bold transition-colors"
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        WhatsApp
                                                    </a>
                                                    {appt.client.instagram && (
                                                        <a
                                                            href={appt.client.instagram.startsWith('http') ? appt.client.instagram : `https://instagram.com/${appt.client.instagram.replace('@', '')}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-pink-50 text-pink-600 text-xs font-bold transition-colors"
                                                        >
                                                            <Instagram className="w-3.5 h-3.5" />
                                                            Instagram
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Services */}
                                <div className="flex flex-wrap gap-2">
                                    {appt.services.map((svc: any) => (
                                        <span key={svc._id} className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-md text-xs">
                                            {svc.name}
                                        </span>
                                    ))}
                                </div>
                                {appt.client_message && (
                                    <p className="text-xs text-slate-400 mt-2 italic">"{appt.client_message}"</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {deleteConfirmId === appt._id ? (
                                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl animate-in fade-in slide-in-from-right-4">
                                        <span className="text-xs text-red-600 font-medium whitespace-nowrap">Sûr ?</span>
                                        <button
                                            onClick={() => handleAction(appt._id, 'cancelled')}
                                            className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="p-1 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirmId(appt._id)}
                                        className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        title="Refuser"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction(appt._id, 'confirmed')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Accepter</span>
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminRequestsPage;
