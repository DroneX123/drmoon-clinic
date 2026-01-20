import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus, X, Check, DollarSign, Package } from 'lucide-react';
import { formatDateForConvex, groupServicesByCategory } from '../../utils/convexHelpers';
import AdminCalendar from '../../components/AdminCalendar';
import AdminTimeSelector from '../../components/AdminTimeSelector';
import ClientContactDisplay from '../../components/ClientContactDisplay';

const AdminAppointmentsPage: React.FC = () => {
    // Date Selection State
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Query Confirmed Appointments for selected Date
    const appointments = useQuery(api.appointments.getConfirmedByDate, {
        date: formatDateForConvex(selectedDate)
    });

    // Services & Products for Modal
    const allServices = useQuery(api.services.getAllServices);
    const allProducts = useQuery(api.products.getAll);

    // Mutations
    const createAppointment = useMutation(api.appointments.createAppointment);
    const completeAppointment = useMutation(api.consultations.completeAppointment);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Receipt / Finish State
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [receiptProducts, setReceiptProducts] = useState<{ productId: string, quantity: number }[]>([]);
    const [receiptFinalPrice, setReceiptFinalPrice] = useState(0);
    const [receiptNextDate, setReceiptNextDate] = useState<Date | null>(null);
    const [receiptNextTime, setReceiptNextTime] = useState('10:00');
    const [receiptNextServices, setReceiptNextServices] = useState<any[]>([]); // New: For next appointment
    const [receiptCurrentServices, setReceiptCurrentServices] = useState<any[]>([]); // New: To edit current appointment
    const [receiptNotes] = useState('');
    const [isNextApptPickerOpen, setIsNextApptPickerOpen] = useState(false);
    const [receiptStep, setReceiptStep] = useState(1); // Wizard Step State



    // Helper to safely parse price
    const parsePrice = (price: any): number => {
        if (typeof price === 'number') return price;
        if (!price) return 0;
        const str = String(price).replace(/[^\d.-]/g, '');
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    };

    // Pre-fill receipt when opening
    const openReceiptModal = (appt: any) => {
        setViewModalAppt(appt);
        setIsModalOpen(false); // Close details modal

        // Reset/Init Receipt Logic
        setReceiptProducts([]);
        setReceiptFinalPrice(appt.services.reduce((acc: number, s: any) => acc + parsePrice(s.price), 0)); // Initial price from current services
        setReceiptNextDate(null);
        setReceiptStep(1); // Reset to Step 1
        setReceiptNextTime('10:00');
        setReceiptNextServices([]); // Default empty for next appt (admin chooses)
        setReceiptCurrentServices(appt.services); // Init with current services

        setIsReceiptModalOpen(true);
        setIsNextApptPickerOpen(false);
    };

    const handleFinishAppointment = async () => {
        if (!viewModalAppt) {
            console.error("No appointment selected for completion");
            return;
        }

        // Helper to format date as YYYY-MM-DD in LOCAL time to avoid UTC shifts
        const formatDateLocal = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        console.log("Attempting to finish appointment...", {
            id: viewModalAppt._id,
            products: receiptProducts,
            amount: receiptFinalPrice,
            amountType: typeof receiptFinalPrice, // Check if number or string
            nextDate: receiptNextDate,
            nextTime: receiptNextTime
        });

        try {
            await completeAppointment({
                appointmentId: viewModalAppt._id,
                productsUsed: receiptProducts as any,
                finalAmount: Number(receiptFinalPrice), // Ensure number
                paymentMethod: 'Cash', // Default for now
                adminNotes: receiptNotes,
                nextAppointmentDate: receiptNextDate ? formatDateLocal(receiptNextDate) : undefined,
                nextAppointmentTime: receiptNextDate ? receiptNextTime : undefined,
                nextAppointmentServices: receiptNextServices.length > 0 ? receiptNextServices.map(s => s._id) : undefined,
                updatedCurrentServices: receiptCurrentServices.map(s => s._id),
            });
            console.log("Appointment completed successfully!");
            setIsReceiptModalOpen(false);
            setViewModalAppt(null); // Clear selection
        } catch (error) {
            console.error("Error completing appointment:", error);
            alert("Une erreur est survenue lors de la finalisation du rendez-vous. Vérifiez la console pour les détails.");
        }
    };





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
                    appointments.map((appt) => {
                        // Check if missed: Confirmed + Date is in past
                        const apptDate = new Date(appt.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isMissed = appt.status === 'confirmed' && apptDate < today;

                        let statusConfig = { bg: 'bg-slate-100', text: 'text-slate-600', label: appt.status };
                        if (appt.status === 'completed') {
                            statusConfig = { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminé' };
                        } else if (appt.status === 'confirmed') {
                            if (isMissed) {
                                statusConfig = { bg: 'bg-red-100', text: 'text-red-700', label: 'Non Présenté' };
                            } else {
                                statusConfig = { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmé' };
                            }
                        }

                        return (
                            <div
                                key={appt._id}
                                onClick={() => setViewModalAppt(appt)}
                                className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all duration-200 group
                                ${isMissed
                                        ? 'bg-red-50/50 border-red-100 hover:border-red-200 hover:shadow-md'
                                        : 'bg-white border-slate-200 hover:border-gold/30 hover:shadow-md'
                                    }`}
                            >
                                {/* Client Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className={`font-bold text-lg ${isMissed ? 'text-red-900' : 'text-slate-900'}`}>
                                            {appt.client ? `${appt.client.first_name} ${appt.client.last_name}` : 'Client Inconnu'}
                                        </h3>
                                        <span className={`${statusConfig.bg} ${statusConfig.text} text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                            <CalendarIcon className="w-3.5 h-3.5 text-gold" />
                                            <span className="font-medium text-slate-700">{appt.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                            <Clock className="w-3.5 h-3.5 text-gold" />
                                            <span className="font-bold text-slate-900">{appt.time}</span>
                                        </div>

                                        {appt.client?.phone && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <ClientContactDisplay
                                                    phone={appt.client.phone}
                                                    instagram={appt.client.instagram}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Services */}
                                    <div className="flex flex-wrap gap-2">
                                        {appt.services.map((svc: any) => (
                                            <span key={svc._id} className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-md text-xs font-medium">
                                                {svc.name}
                                            </span>
                                        ))}
                                        {appt.services.length === 0 && <span className="text-xs text-slate-400 italic">Aucun service spécifié</span>}
                                    </div>
                                </div>

                                {/* Action Arrow */}
                                <div className="pl-4 border-l border-slate-100 hidden md:flex items-center justify-center min-w-[30px]">
                                    {appt.status === 'completed' ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                                <span className="text-xs">Payé:</span>
                                                <span>{appt.consultation?.amount_paid?.toLocaleString()} DA</span>
                                            </div>
                                            {appt.consultation?.products_processed?.length > 0 && (
                                                <div className="text-[10px] text-slate-400 text-right max-w-[120px]">
                                                    + {appt.consultation.products_processed.length} produits
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <ChevronRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${isMissed ? 'text-red-300' : 'text-slate-300 group-hover:text-gold'}`} />
                                    )}
                                </div>
                            </div>
                        )
                    })
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

            {/* RECEIPT / FINISH MODAL */}
            {/* RECEIPT / FINISH MODAL */}
            {/* RECEIPT / FINISH MODAL */}
            {isReceiptModalOpen && viewModalAppt && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-0 flex flex-col max-h-[90vh] overflow-hidden relative transition-all">

                        {/* Header with Stepper */}
                        <div className="p-6 border-b border-slate-100 bg-white relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="font-serif text-2xl text-slate-900 mb-1">Consultation</h2>
                                    <p className="text-slate-500 text-sm">
                                        Patient: <span className="font-bold text-slate-900">{viewModalAppt.client?.first_name} {viewModalAppt.client?.last_name}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsReceiptModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* STEPS INDICATOR */}
                            <div className="flex items-center justify-between px-4 sm:px-12 relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 transform -translate-y-1/2 mx-16 sm:mx-20" />

                                {[
                                    { id: 1, label: "Services", icon: Check },
                                    { id: 2, label: "Produits", icon: Package },
                                    { id: 3, label: "Prochain RDV", icon: CalendarIcon },
                                    { id: 4, label: "Paiement", icon: DollarSign }
                                ].map((step) => {
                                    const isActive = receiptStep >= step.id;
                                    const isCurrent = receiptStep === step.id;
                                    const Icon = step.icon;

                                    return (
                                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                                                ${isActive ? 'bg-slate-900 border-slate-900 text-gold' : 'bg-white border-slate-200 text-slate-300'}
                                                ${isCurrent ? 'ring-4 ring-gold/20 scale-110' : ''}
                                            `}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors
                                                ${isActive ? 'text-slate-900' : 'text-slate-300'}
                                            `}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 relative">

                            {/* STEP 1: SERVICES */}
                            {receiptStep === 1 && (
                                <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-6">
                                    <div className="text-center mb-8">
                                        <h3 className="text-lg font-bold text-slate-900">Services Effectués</h3>
                                        <p className="text-slate-500 text-sm">Cochez les soins réalisés aujourd'hui.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                        {allServices && groupServicesByCategory(allServices).map((group: any) => (
                                            <div key={group.id} className="col-span-full">
                                                <h4 className="text-slate-400 text-xs font-bold uppercase mb-3 pl-1">{group.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {group.treatments.map((svc: any) => {
                                                        const isSelected = receiptCurrentServices.some(s => s._id === svc._id);
                                                        return (
                                                            <div
                                                                key={svc._id}
                                                                onClick={() => {
                                                                    let newServices;
                                                                    if (isSelected) {
                                                                        newServices = receiptCurrentServices.filter(s => s._id !== svc._id);
                                                                    } else {
                                                                        newServices = [...receiptCurrentServices, svc];
                                                                    }
                                                                    setReceiptCurrentServices(newServices);
                                                                    // Recalculate Total
                                                                    const servicesTotal = newServices.reduce((acc, s) => acc + parsePrice(s.price), 0);
                                                                    const productsTotal = receiptProducts.reduce((acc, p) => {
                                                                        const prod = allProducts?.find(ap => ap._id === p.productId);
                                                                        const price = parsePrice(prod?.selling_price);
                                                                        return acc + (price * p.quantity);
                                                                    }, 0);
                                                                    setReceiptFinalPrice(servicesTotal + productsTotal);
                                                                }}
                                                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group relative overflow-hidden flex items-center justify-between
                                                                    ${isSelected
                                                                        ? 'bg-white border-gold shadow-md ring-1 ring-gold/20'
                                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                                        ${isSelected ? 'bg-gold border-gold text-slate-900' : 'border-slate-300 text-transparent'}`}>
                                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                    </div>
                                                                    <span className={`font-bold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{svc.name}</span>
                                                                </div>
                                                                <span className="font-serif font-bold text-sm text-slate-400">
                                                                    {parsePrice(svc.price).toLocaleString()} DA
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PRODUCTS */}
                            {receiptStep === 2 && (
                                <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-6">
                                    <div className="text-center mb-8">
                                        <h3 className="text-lg font-bold text-slate-900">Produits Utilisés</h3>
                                        <p className="text-slate-500 text-sm">Ajoutez les produits consommés durant la séance (optionnel).</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {allProducts?.map(product => {
                                            const current = receiptProducts.find(p => p.productId === product._id);
                                            const quantity = current?.quantity || 0;
                                            const isActive = quantity > 0;

                                            return (
                                                <div
                                                    key={product._id}
                                                    onClick={() => {
                                                        if (!isActive) {
                                                            const updated = [...receiptProducts, { productId: product._id, quantity: 1 }];
                                                            setReceiptProducts(updated);
                                                            // Recalc Total
                                                            const servicesTotal = receiptCurrentServices.reduce((acc, s) => acc + parsePrice(s.price), 0);
                                                            const productsTotal = updated.reduce((acc, p) => {
                                                                const prod = allProducts?.find(ap => ap._id === p.productId);
                                                                const price = parsePrice(prod?.selling_price);
                                                                return acc + (price * p.quantity);
                                                            }, 0);
                                                            setReceiptFinalPrice(servicesTotal + productsTotal);
                                                        }
                                                    }}
                                                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col gap-3 cursor-pointer group relative overflow-hidden
                                                        ${isActive
                                                            ? 'bg-white border-gold shadow-md'
                                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className={`font-bold text-sm line-clamp-2 ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {product.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                            Stock: {product.stock_quantity}
                                                        </span>
                                                    </div>

                                                    {isActive ? (
                                                        <div className="flex items-center justify-between mt-auto pt-2 animate-in fade-in slide-in-from-bottom-2">
                                                            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => {
                                                                        const newQty = Math.max(0, quantity - 1);
                                                                        let updated;
                                                                        if (newQty === 0) {
                                                                            updated = receiptProducts.filter(p => p.productId !== product._id);
                                                                        } else {
                                                                            updated = receiptProducts.map(p => p.productId === product._id ? { ...p, quantity: newQty } : p);
                                                                        }
                                                                        setReceiptProducts(updated);
                                                                        // Recalc
                                                                        const servicesTotal = receiptCurrentServices.reduce((acc, s) => acc + parsePrice(s.price), 0);
                                                                        const productsTotal = updated.reduce((acc, p) => {
                                                                            const prod = allProducts?.find(ap => ap._id === p.productId);
                                                                            const price = parsePrice(prod?.selling_price);
                                                                            return acc + (price * p.quantity);
                                                                        }, 0);
                                                                        setReceiptFinalPrice(servicesTotal + productsTotal);
                                                                    }}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:text-red-500 text-slate-400 transition-colors shadow-sm"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="min-w-[20px] text-center font-bold text-slate-900 text-sm">
                                                                    {quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        const newQty = quantity + 1;
                                                                        const updated = receiptProducts.map(p => p.productId === product._id ? { ...p, quantity: newQty } : p);
                                                                        setReceiptProducts(updated);
                                                                        // Recalc
                                                                        const servicesTotal = receiptCurrentServices.reduce((acc, s) => acc + parsePrice(s.price), 0);
                                                                        const productsTotal = updated.reduce((acc, p) => {
                                                                            const prod = allProducts?.find(ap => ap._id === p.productId);
                                                                            const price = parsePrice(prod?.selling_price);
                                                                            return acc + (price * p.quantity);
                                                                        }, 0);
                                                                        setReceiptFinalPrice(servicesTotal + productsTotal);
                                                                    }}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-slate-900 hover:text-white text-slate-400 transition-colors shadow-sm"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-auto pt-2 text-center text-xs text-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Ajouter
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: NEXT APPOINTMENT */}
                            {receiptStep === 3 && (
                                <div className="animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col items-center max-w-lg mx-auto py-4">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-900">Prochain Rendez-vous</h3>
                                        <p className="text-slate-500 text-sm">Planifier la prochaine séance maintenant.</p>
                                    </div>

                                    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                                        <AdminCalendar
                                            value={receiptNextDate || new Date()}
                                            onChange={(d) => setReceiptNextDate(d)}
                                        />

                                        {!receiptNextDate && (
                                            <p className="text-center text-xs text-slate-400 mt-4 italic">
                                                Aucune date sélectionnée (Pas de prochain RDV)
                                            </p>
                                        )}
                                    </div>

                                    {receiptNextDate && (
                                        <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Heure</p>
                                                <input
                                                    type="time"
                                                    value={receiptNextTime}
                                                    onChange={(e) => setReceiptNextTime(e.target.value)}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                                                />
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Services à prévoir</p>
                                                <div className="space-y-1 max-h-[150px] overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50 custom-scrollbar">
                                                    {allServices && groupServicesByCategory(allServices).map((group: any) => (
                                                        <div key={group.id}>
                                                            <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 mb-1 pl-1">{group.title}</p>
                                                            {group.treatments.map((svc: any) => {
                                                                const isSelected = receiptNextServices.some(s => s._id === svc._id);
                                                                return (
                                                                    <button
                                                                        key={svc._id}
                                                                        onClick={() => {
                                                                            if (isSelected) setReceiptNextServices(prev => prev.filter(s => s._id !== svc._id));
                                                                            else setReceiptNextServices(prev => [...prev, svc]);
                                                                        }}
                                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-between
                                                                                ${isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                                                                    >
                                                                        <span className="truncate">{svc.name}</span>
                                                                        {isSelected && <Check className="w-3 h-3 text-gold" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: SUMMARY & PAYMENT */}
                            {receiptStep === 4 && (
                                <div className="animate-in slide-in-from-right-4 fade-in duration-300 max-w-lg mx-auto space-y-6">
                                    <div className="text-center mb-8">
                                        <h3 className="text-lg font-bold text-slate-900">Récapitulatif & Paiement</h3>
                                        <p className="text-slate-500 text-sm">Vérifiez les détails avant d'encaisser.</p>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        {/* Services Summary */}
                                        <div className="p-4 border-b border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Services</h4>
                                            <div className="space-y-2">
                                                {receiptCurrentServices.map(s => (
                                                    <div key={s._id} className="flex justify-between text-sm">
                                                        <span className="text-slate-700 font-medium">{s.name}</span>
                                                        <span className="text-slate-900 font-bold">{parsePrice(s.price).toLocaleString()} DA</span>
                                                    </div>
                                                ))}
                                                {receiptCurrentServices.length === 0 && <p className="text-slate-400 italic text-sm">Aucun service</p>}
                                            </div>
                                        </div>

                                        {/* Products Summary */}
                                        {receiptProducts.length > 0 && (
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Produits (Supplément)</h4>
                                                <div className="space-y-2">
                                                    {receiptProducts.map(p => {
                                                        const prod = allProducts?.find(ap => ap._id === p.productId);
                                                        const price = parsePrice(prod?.selling_price) * p.quantity;
                                                        return (
                                                            <div key={p.productId} className="flex justify-between text-sm">
                                                                <span className="text-slate-700">{prod?.name} <span className="text-slate-400 text-xs">x{p.quantity}</span></span>
                                                                <span className="text-slate-900 font-bold">{price.toLocaleString()} DA</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Next Appt Summary */}
                                        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
                                            <CalendarIcon className="w-4 h-4 text-gold" />
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-500 uppercase">Prochain RDV</p>
                                                {receiptNextDate ? (
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {receiptNextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {receiptNextTime}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-slate-400 italic">Non planifié</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                            <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Total à Payer</span>
                                            <span className="font-serif text-3xl font-bold text-gold">
                                                {receiptFinalPrice.toLocaleString()} <span className="text-lg">DA</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Navigation */}
                        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                            {receiptStep > 1 ? (
                                <button
                                    onClick={() => setReceiptStep(prev => prev - 1)}
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Retour
                                </button>
                            ) : (
                                <div></div> // Spacer
                            )}

                            {receiptStep < 4 ? (
                                <button
                                    onClick={() => setReceiptStep(prev => prev + 1)}
                                    className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
                                >
                                    Suivant <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleFinishAppointment}
                                    className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Terminer & Encaisser
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* VIEW APPOINTMENT DETAILS MODAL */}
            {
                viewModalAppt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200 flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => setViewModalAppt(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-6">
                                {/* STATUS BADGE - REFINED */}
                                <div className="flex justify-center mb-4">
                                    {(() => {
                                        // Status Logic
                                        const apptDate = new Date(viewModalAppt.date);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);

                                        let statusConfig = { bg: 'bg-slate-100', text: 'text-slate-600', label: viewModalAppt.status };

                                        if (viewModalAppt.status === 'completed') {
                                            statusConfig = { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminé' };
                                        } else if (viewModalAppt.status === 'confirmed') {
                                            if (apptDate < today) {
                                                statusConfig = { bg: 'bg-red-100', text: 'text-red-700', label: 'Non Présenté' };
                                            } else {
                                                statusConfig = { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmé' };
                                            }
                                        } else if (viewModalAppt.status === 'pending') {
                                            statusConfig = { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Attente' };
                                        }

                                        return (
                                            <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                                                {statusConfig.label}
                                            </span>
                                        );
                                    })()}
                                </div>

                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <User className="w-8 h-8 text-gold" />
                                </div>
                                <h2 className="text-2xl font-serif text-slate-900 mb-2">{viewModalAppt.client?.first_name} {viewModalAppt.client?.last_name}</h2>

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
                                {/* Date & Time */}
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

                                    {/* Total Price for Completed Appointments */}
                                    {viewModalAppt.status === 'completed' && viewModalAppt.consultation?.amount_paid !== undefined && (
                                        <div className="bg-slate-800 p-3 text-center border-t border-white/10">
                                            <p className="text-xs text-white/50 uppercase font-bold mb-1">Total Payé</p>
                                            <p className="font-serif font-bold text-xl text-green-400">
                                                {viewModalAppt.consultation.amount_paid.toLocaleString()} DA
                                            </p>
                                        </div>
                                    )}
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

                            {/* Finish Action - CONDITIONAL */}
                            {/* Show for Confirmed appointments, regardless of date (allows late processing) */}
                            {viewModalAppt.status === 'confirmed' && (
                                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                                    <button
                                        onClick={() => openReceiptModal(viewModalAppt)}
                                        className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                                        </div>
                                        Démarrer Consultation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminAppointmentsPage;
