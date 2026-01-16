import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FileText, Search, User, Calendar as CalendarIcon, Clock, ChevronRight, X } from 'lucide-react';
import ClientContactDisplay from '../../components/ClientContactDisplay';

const AdminConsultationsPage: React.FC = () => {
    const consultations = useQuery(api.consultations.getAll);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewModalAppt, setViewModalAppt] = useState<any>(null);

    // Filter consultations
    const filteredConsultations = consultations?.filter((c: any) => {
        const clientName = c.client ? `${c.client.first_name} ${c.client.last_name}`.toLowerCase() : '';
        return clientName.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-2">Historique Consultations</h1>
                    <p className="text-slate-500">Retrouvez tous les rendez-vous terminés et encaissés.</p>
                </div>
            </div>

            {/* Sticky Search Bar */}
            <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-gold/30 outline-none transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4 pb-20">
                {!consultations ? (
                    <div className="text-center py-12 text-slate-400">Chargement...</div>
                ) : filteredConsultations?.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Aucune consultation trouvée</h3>
                        <p className="text-slate-500">Essayez une autre recherche.</p>
                    </div>
                ) : (
                    filteredConsultations?.map((consultation: any) => {
                        const apptDate = consultation.appointment ? consultation.appointment.date : consultation.date;
                        const apptTime = consultation.appointment ? consultation.appointment.time : '??:??';

                        // Construct an appointment-like object for the modal view if needed
                        const apptObj = {
                            ...consultation.appointment,
                            client: consultation.client,
                            services: consultation.services || [],
                            status: 'completed',
                            consultation: consultation // Embed the consultation data itself
                        };

                        return (
                            <div
                                key={consultation._id}
                                onClick={() => setViewModalAppt(apptObj)}
                                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-gold/30 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    {/* Left: Client & Status */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="font-bold text-xl text-slate-900">
                                                {consultation.client ? `${consultation.client.first_name} ${consultation.client.last_name}` : 'Client Inconnu'}
                                            </h3>
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
                                                Terminé
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-700 font-medium text-sm">
                                                <CalendarIcon className="w-3.5 h-3.5 text-gold" />
                                                <span>{apptDate}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-900 font-bold text-sm">
                                                <Clock className="w-3.5 h-3.5 text-gold" />
                                                <span>{apptTime}</span>
                                            </div>

                                            {consultation.client?.phone && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ClientContactDisplay
                                                        phone={consultation.client.phone}
                                                        instagram={consultation.client.instagram}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Services */}
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {consultation.services?.length > 0 ? (
                                                consultation.services.map((svc: any) => (
                                                    <span key={svc._id} className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                        {svc.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Aucun service spécifié</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Payment Info & Arrow */}
                                    <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total Payé</p>
                                            <p className="text-xl font-serif font-bold text-green-600">
                                                {consultation.amount_paid?.toLocaleString()} DA
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase mt-1">{consultation.payment_method} • {consultation.products_used?.length || 0} produits</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-gold transition-colors" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* VIEW DETAILS MODAL (Reused logic roughly) */}
            {viewModalAppt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200 flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setViewModalAppt(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <span className="inline-block px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider bg-green-100 text-green-700 mb-4">
                                Terminé
                            </span>
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <User className="w-8 h-8 text-gold" />
                            </div>
                            <h2 className="text-2xl font-serif text-slate-900 mb-2">
                                {viewModalAppt.client?.first_name} {viewModalAppt.client?.last_name}
                            </h2>
                            {viewModalAppt.client?.phone && (
                                <div className="flex justify-center">
                                    <ClientContactDisplay
                                        phone={viewModalAppt.client.phone}
                                        instagram={viewModalAppt.client.instagram}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden">
                                <div className="flex items-center justify-between p-4">
                                    <div className="text-center flex-1 border-r border-white/10">
                                        <p className="text-xs text-white/50 uppercase font-bold mb-1">Date</p>
                                        <p className="font-bold text-lg capitalize">
                                            {new Date(viewModalAppt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="text-xs text-white/50 uppercase font-bold mb-1">Heure</p>
                                        <p className="font-bold text-lg text-gold">{viewModalAppt.time}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-800 p-3 text-center border-t border-white/10">
                                    <p className="text-xs text-white/50 uppercase font-bold mb-1">Total Payé</p>
                                    <p className="font-serif font-bold text-xl text-green-400">
                                        {viewModalAppt.consultation?.amount_paid?.toLocaleString()} DA
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Services Effectués</h3>
                                <div className="space-y-2">
                                    {viewModalAppt.services.map((svc: any) => (
                                        <div key={svc._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{svc.name}</p>
                                                <p className="text-xs text-slate-400">{svc.duration_minutes} min</p>
                                            </div>
                                            <span className="font-serif text-gold font-bold">{svc.price > 0 ? `${svc.price.toLocaleString()} DA` : 'Offert'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {viewModalAppt.consultation?.admin_notes && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Note Admin</h3>
                                    <div className="text-sm bg-yellow-50 border border-yellow-100 p-3 rounded-xl text-yellow-800">
                                        {viewModalAppt.consultation.admin_notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminConsultationsPage;
