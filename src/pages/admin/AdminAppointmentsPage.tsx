import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Phone, Plus, X, Check } from 'lucide-react';
import { formatDateForConvex, groupServicesByCategory } from '../../utils/convexHelpers';
import AdminCalendar from '../../components/AdminCalendar';
import AdminTimeSelector from '../../components/AdminTimeSelector';

const AdminAppointmentsPage: React.FC = () => {
    // Date Selection State
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Query Confirmed Appointments for selected Date
    const appointments = useQuery(api.appointments.getConfirmedByDate, {
        date: formatDateForConvex(selectedDate)
    });

    // Services for Modal
    const allServices = useQuery(api.services.getAllServices);
    const createAppointment = useMutation(api.appointments.createAppointment);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Appointment Form State
    const [clientFirstName, setClientFirstName] = useState('');
    const [clientLastName, setClientLastName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [apptTime, setApptTime] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [adminNotes, setAdminNotes] = useState('');

    const handleCreate = async () => {
        if (!clientFirstName || !clientLastName || !clientPhone || !apptTime || selectedServiceIds.length === 0) {
            alert("Veuillez remplir tous les champs obligatoires (Client, Heure, Services).");
            return;
        }

        await createAppointment({
            firstName: clientFirstName,
            lastName: clientLastName,
            phone: clientPhone,
            date: formatDateForConvex(selectedDate), // Use currently selected date in agenda
            time: apptTime,
            serviceIds: selectedServiceIds as any,
            adminNotes: adminNotes,
            status: "confirmed", // Create directly as confirmed
        });

        setIsModalOpen(false);
        // Reset form
        setClientFirstName('');
        setClientLastName('');
        setClientPhone('');
        setApptTime('');
        setSelectedServiceIds([]);
        setAdminNotes('');
    };

    const handleServiceToggle = (serviceId: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    // Generate Date Strip (Week view: -3 to +3 days)
    const dates = [];
    for (let i = -3; i <= 3; i++) {
        const d = new Date(selectedDate);
        d.setDate(selectedDate.getDate() + i);
        dates.push(d);
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleMonthNav = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    // Group Services
    const groupedServices = allServices ? groupServicesByCategory(allServices) : [];

    // View Details Modal State
    const [viewModalAppt, setViewModalAppt] = useState<any>(null);

    return (
        <div className="h-full flex flex-col relative">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-1">Agenda</h1>
                    <p className="text-slate-500 text-sm">Vue d'ensemble des rendez-vous confirmés.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Add Appointment Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-gold px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau RDV</span>
                    </button>

                    {/* Month Selector */}
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 px-2 py-1 shadow-sm">
                        <button onClick={() => handleMonthNav('prev')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="min-w-[120px] text-center font-bold text-slate-800 text-sm">
                            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </span>
                        <button onClick={() => handleMonthNav('next')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Horizontal Date Strip */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 1);
                        setSelectedDate(d);
                    }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-4">
                        {dates.map((date, index) => {
                            const isSelected = isSameDay(date, selectedDate);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateSelect(date)}
                                    className={`flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-2xl transition-all duration-300 ${isSelected
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-105'
                                        : 'bg-transparent text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${isSelected ? 'text-white/60' : ''}`}>
                                        {date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}
                                    </span>
                                    <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                        {String(date.getDate()).padStart(2, '0')}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 1);
                        setSelectedDate(d);
                    }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Appointments List */}
            <div className="flex-1 space-y-4 overflow-y-auto pb-20 custom-scrollbar">
                {!appointments ? (
                    <div className="text-center py-10 text-slate-400">Chargement...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Aucun rendez-vous pour cette date.</p>
                    </div>
                ) : (
                    appointments.map((appt) => (
                        <div
                            key={appt._id}
                            onClick={() => setViewModalAppt(appt)}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer hover:border-gold/30"
                        >
                            <div className="flex items-center gap-4">
                                {/* Time Column */}
                                <div className="flex flex-col items-center justify-center px-4 border-r border-slate-100 min-w-[80px]">
                                    <span className="text-lg font-bold text-slate-900">{appt.time}</span>
                                    <span className="text-xs text-slate-400 uppercase font-medium">Heure</span>
                                </div>

                                {/* Patient Info */}
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        {appt.client ? `${appt.client.first_name} ${appt.client.last_name}` : 'Client Inconnu'}
                                        {appt.client?.phone && (
                                            <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Phone className="w-3 h-3" />  {appt.client.phone}
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <span className="bg-gold/10 text-gold px-2 py-0.5 rounded-md font-medium text-xs">
                                            {appt.services.length} Service(s)
                                        </span>
                                        <span>•</span>
                                        <span className="truncate max-w-[200px]">
                                            {appt.services.map((s: any) => s.name).join(', ')}
                                        </span>
                                    </div>
                                    {appt.admin_notes && (
                                        <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-1 rounded border border-slate-100 inline-block">
                                            Note Admin: "{appt.admin_notes}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400 group-hover:text-gold transition-colors uppercase tracking-wider">
                                    Voir Détails
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-gold transition-colors" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* CREATE APPOINTMENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif text-slate-900">Nouveau Rendez-vous</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">

                            {/* 1. Client Details */}
                            <section>
                                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-2">
                                    <User className="w-3 h-3" /> Informations Client
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Prénom"
                                        value={clientFirstName}
                                        onChange={(e) => setClientFirstName(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-gold/30 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Nom"
                                        value={clientLastName}
                                        onChange={(e) => setClientLastName(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-gold/30 outline-none"
                                    />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Téléphone (ex: 0550...)"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-gold/30 outline-none"
                                />
                            </section>

                            <hr className="border-slate-100" />

                            {/* 2. Appointment Details */}
                            <section>
                                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3" /> Détails Rendez-vous
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Date */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-gold" />
                                                Date
                                                <span className="text-slate-400 font-normal text-xs capitalize ml-2">
                                                    {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </h5>
                                        </div>
                                        <AdminCalendar
                                            value={selectedDate}
                                            onChange={setSelectedDate}
                                        />
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                                            <Clock className="w-4 h-4 text-gold" />
                                            Heure
                                        </h5>
                                        <AdminTimeSelector
                                            value={apptTime}
                                            onChange={setApptTime}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Sélectionner les Services</p>
                                    {groupedServices.map((group: any) => (
                                        <div key={group.id} className="border border-slate-100 rounded-xl p-4 bg-white">
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
                            </section>

                            {/* 3. Notes */}
                            <section>
                                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Notes</h3>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Note interne..."
                                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-gold/30 resize-none"
                                />
                            </section>
                        </div>

                        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 px-4 py-3 rounded-xl bg-grad-gold text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Créer le Rendez-vous
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW APPOINTMENT DETAILS MODAL */}
            {viewModalAppt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200 flex flex-col relative">
                        <button
                            onClick={() => setViewModalAppt(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <User className="w-8 h-8 text-gold" />
                            </div>
                            <h2 className="text-2xl font-serif text-slate-900">{viewModalAppt.client?.first_name} {viewModalAppt.client?.last_name}</h2>
                            <a href={`tel:${viewModalAppt.client?.phone}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-gold transition-colors mt-2 bg-slate-50 px-3 py-1 rounded-full text-sm font-medium">
                                <Phone className="w-3 h-3" />
                                {viewModalAppt.client?.phone}
                            </a>
                        </div>

                        <div className="space-y-6">
                            {/* Date & Time */}
                            <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-lg shadow-slate-900/20">
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

                            {/* Services List */}
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Services Réservés</h3>
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

                            {/* Notes */}
                            {(viewModalAppt.admin_notes || viewModalAppt.client_message) && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Notes</h3>
                                    <div className="space-y-2">
                                        {viewModalAppt.admin_notes && (
                                            <div className="text-sm bg-yellow-50 border border-yellow-100 p-3 rounded-xl text-yellow-800">
                                                <span className="font-bold block text-xs uppercase mb-1 opacity-70">Note Admin</span>
                                                {viewModalAppt.admin_notes}
                                            </div>
                                        )}
                                        {viewModalAppt.client_message && (
                                            <div className="text-sm bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600 italic">
                                                <span className="font-bold block text-xs uppercase mb-1 opacity-70 not-italic">Message Client</span>
                                                "{viewModalAppt.client_message}"
                                            </div>
                                        )}
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

export default AdminAppointmentsPage;
