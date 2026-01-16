import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Phone } from 'lucide-react';
import { formatDateForConvex } from '../../utils/convexHelpers';

const AdminAppointmentsPage: React.FC = () => {
    // Date Selection State
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Query Confirmed Appointments for selected Date
    const appointments = useQuery(api.appointments.getConfirmedByDate, {
        date: formatDateForConvex(selectedDate)
    });

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

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-1">Agenda</h1>
                    <p className="text-slate-500 text-sm">Vue d'ensemble des rendez-vous confirmés.</p>
                </div>

                {/* Month Selector */}
                <div className="flex items-center bg-white rounded-xl border border-slate-200 px-2 py-1 shadow-sm">
                    <button onClick={() => handleMonthNav('prev')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="min-w-[120px] text-center font-bold text-slate-800 text-sm">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </span>
                    <button onClick={() => handleMonthNav('next')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronRight className="w-4 h-4" /></button>
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
            <div className="flex-1 space-y-4">
                {!appointments ? (
                    <div className="text-center py-10 text-slate-400">Chargement...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Aucun rendez-vous pour cette date.</p>
                    </div>
                ) : (
                    appointments.map((appt) => (
                        <div key={appt._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
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
                                    {appt.client_message && (
                                        <p className="text-xs text-slate-400 mt-1 italic">Note: "{appt.client_message}"</p>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Confirmé
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminAppointmentsPage;
