import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Check, X, Calendar, Phone, MessageCircle } from 'lucide-react';

const AdminAppointmentsPage: React.FC = () => {
    const pendingAppointments = useQuery(api.appointments.getPending);
    const updateStatus = useMutation(api.appointments.updateStatus);
    const [phoneMenuId, setPhoneMenuId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleAction = async (id: any, newStatus: string) => {
        // Confirmation handling is now in UI
        await updateStatus({ id, status: newStatus });
        if (newStatus === 'cancelled') setDeleteConfirmId(null);
    };

    if (pendingAppointments === undefined) {
        return <div className="text-slate-400 text-sm">Chargement...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-serif text-3xl text-slate-900 mb-1">Demandes de Rendez-vous</h1>
                <p className="text-slate-500 text-sm">Gérez les demandes en attente d'approbation.</p>
            </div>

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
                                            <button
                                                onClick={() => setPhoneMenuId(phoneMenuId === appt._id ? null : appt._id)}
                                                className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                                            >
                                                <Phone className="w-4 h-4 text-gold" />
                                                <span className="underline decoration-dotted">{appt.client.phone}</span>
                                            </button>

                                            {phoneMenuId === appt._id && (
                                                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-10 min-w-[150px] flex flex-col gap-1">
                                                    <a
                                                        href={`tel:${appt.client.phone}`}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-bold"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        Appeler
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/${appt.client.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-green-600 text-xs font-bold"
                                                    >
                                                        <MessageCircle className="w-3 h-3" />
                                                        WhatsApp
                                                    </a>
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

export default AdminAppointmentsPage;
