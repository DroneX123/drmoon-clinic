import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check, ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MoonMenuIcon from '../components/MoonMenuIcon';
import PhoneInput from '../components/PhoneInput';
import { groupServicesByCategory, formatDateForConvex } from '../utils/convexHelpers';

// Assets
import luxuryHero from '../assets/luxury_hero.png';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();

    // --- CONVEX STATE ---
    const services = useQuery(api.services.getAllServices) || [];
    const createAppointment = useMutation(api.appointments.createAppointment);

    // --- WIZARD STATE ---
    const [step, setStep] = useState(0);

    // --- DATA STATE ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '+213', email: '', instagram: '', description: ''
    });

    // --- UI STATE ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [instagramError, setInstagramError] = useState('');
    const [isPhoneValid, setIsPhoneValid] = useState(false);

    // Helpers
    const RITUALS = useMemo(() => groupServicesByCategory(services), [services]);
    const totalPrice = useMemo(() => {
        let total = 0;
        selectedTreatments.forEach(name => {
            const svc = services.find(s => s.name === name);
            if (svc && !svc.price.toLowerCase().includes('offert')) {
                const val = parseInt(svc.price.replace(/\D/g, ''), 10);
                if (!isNaN(val)) total += val;
            }
        });
        return total;
    }, [selectedTreatments, services]);

    // Handlers
    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (!formData.firstName || !formData.lastName) throw new Error("Nom et Prénom requis");
            // Relaxed validation for "dumb" flow - try to submit even if phone incomplete if they insist, but UI blocks it

            const serviceIds = selectedTreatments
                .map(name => services.find(s => s.name === name)?._id)
                .filter(Boolean) as Id<"services">[];

            if (!selectedDate) throw new Error("Date manquante");

            await createAppointment({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email || undefined,
                instagram: formData.instagram,
                serviceIds,
                date: formatDateForConvex(selectedDate),
                time: "09:00",
                clientMessage: formData.description || undefined,
            });
            setStep(4);
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- COMPONENTS ---

    // 0. SPLASH
    const Step0_Splash = () => (
        <div className="flex flex-col h-full justify-between p-8 pb-12 animate-in fade-in duration-1000">
            <div className="pt-12">
                <MoonMenuIcon className="h-10 w-10 text-white drop-shadow-lg mx-auto" />
            </div>
            <div className="text-center">
                <h1 className="font-serif text-5xl text-white mb-2 drop-shadow-lg">Cabinet Dr. Berrim</h1>
                <p className="text-white/80 text-lg font-light tracking-wide drop-shadow-md mb-8">L'excellence esthétique à votre portée.</p>
                <button
                    onClick={() => setStep(1)}
                    className="w-full bg-white text-slate-900 font-bold uppercase tracking-widest py-5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform text-sm"
                >
                    Réserver Maintenant
                </button>
            </div>
        </div>
    );

    // 1. SERVICES (Instagram Story Style List)
    const Step1_Services = () => (
        <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-t-[2rem] animate-in slide-in-from-bottom duration-500">
            <div className="p-6 text-center border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Choisissez vos soins</h2>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Sélection multiple possible</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {RITUALS.map(cat => (
                    <div key={cat.id} className="space-y-2">
                        <h3 className="text-gold text-xs font-bold uppercase tracking-widest pl-2 mt-4 mb-2 opacity-80">{cat.title}</h3>
                        {cat.treatments.map(t => {
                            const selected = selectedTreatments.includes(t.name);
                            return (
                                <div key={t.name}
                                    onClick={() => setSelectedTreatments(prev => prev.includes(t.name) ? prev.filter(x => x !== t.name) : [...prev, t.name])}
                                    className={`p-4 rounded-2xl flex justify-between items-center transition-all ${selected ? 'bg-gold text-slate-900' : 'bg-white/5 text-white'}`}
                                >
                                    <div>
                                        <p className="font-bold text-sm">{t.name}</p>
                                        <p className={`text-xs ${selected ? 'text-slate-800' : 'text-white/50'}`}>{t.price}</p>
                                    </div>
                                    {selected && <Check size={20} />}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-white/5 bg-slate-900">
                <button
                    disabled={selectedTreatments.length === 0}
                    onClick={() => setStep(2)}
                    className="w-full bg-gold text-slate-900 font-bold uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 disabled:grayscale transition-all"
                >
                    Continuer ({totalPrice.toLocaleString()} DA)
                </button>
            </div>
        </div>
    );

    // 2. CALENDAR (Simple iOS Wheel Vibe)
    const Step2_Date = () => {
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        return (
            <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-t-[2rem] animate-in slide-in-from-bottom duration-500">
                <div className="p-6 text-center border-b border-white/5">
                    <h2 className="font-serif text-2xl text-white">Quelle date ?</h2>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    {/* Month Nav */}
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><ArrowLeft className="text-white/50" /></button>
                        <span className="text-xl font-serif text-gold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><ArrowLeft className="text-white/50 rotate-180" /></button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-3 w-full max-w-xs">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <span key={d} className="text-center text-xs text-white/30 font-bold">{d}</span>)}
                        {Array.from({ length: (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() || 7) - 1 }).map((_, i) => <div key={i} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const d = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            return (
                                <button key={d} disabled={isPast} onClick={() => setSelectedDate(date)}
                                    className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                                        ${isSelected ? 'bg-gold text-slate-900 scale-110 shadow-lg shadow-gold/40' :
                                            isPast ? 'text-white/10' : 'bg-white/5 text-white hover:bg-white/10'}
                                    `}
                                >{d}</button>
                            )
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-slate-900">
                    <button disabled={!selectedDate} onClick={() => setStep(3)}
                        className="w-full bg-gold text-slate-900 font-bold uppercase tracking-widest py-4 rounded-xl disabled:opacity-50"
                    >
                        Valider la date
                    </button>
                </div>
            </div>
        );
    };

    // 3. DETAILS (Big Inputs)
    const Step3_Details = () => (
        <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-t-[2rem] animate-in slide-in-from-bottom duration-500">
            <div className="p-6 text-center border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">C'est presque fini</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="bg-white/5 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-gold w-full" />
                    <input placeholder="Nom" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="bg-white/5 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-gold w-full" />
                </div>

                <PhoneInput value={formData.phone} onChange={(v, valid) => { setFormData({ ...formData, phone: v }); setIsPhoneValid(valid) }} />

                <div className="relative">
                    <input placeholder="Instagram (@pseudo)" value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} className="bg-white/5 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-gold w-full pl-12" />
                    <span className="absolute left-4 top-4 text-gold">@</span>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mt-8">
                    <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Récapitulatif</p>
                    <div className="flex justify-between text-white text-sm">
                        <span>{selectedTreatments.length} Soins</span>
                        <span>{totalPrice.toLocaleString()} DA</span>
                    </div>
                    {selectedDate && <div className="text-gold font-bold mt-1 text-sm">{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>}
                </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-slate-900">
                {errorMessage && <p className="text-red-400 text-center text-xs mb-2">{errorMessage}</p>}
                <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.instagram}
                    className="w-full bg-gold text-slate-900 font-bold uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Traitement...' : 'Confirmer le RDV'}
                </button>
            </div>
        </div>
    );

    // 4. SUCCESS
    const Step4_Success = () => (
        <div className="flex flex-col h-full items-center justify-center text-center p-8 bg-slate-900/90 backdrop-blur-md rounded-t-[2rem] animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-gold/30">
                <Check className="h-10 w-10 text-slate-900" />
            </div>
            <h2 className="font-serif text-4xl text-white mb-2">Félicitations</h2>
            <p className="text-white/70 mb-8 max-w-xs mx-auto">Votre rendez-vous est confirmé.<br />On s'occupe de tout.</p>
            <button onClick={() => navigate('/')} className="text-gold uppercase text-sm tracking-widest font-bold border-b border-gold pb-1">Retour à l'accueil</button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-950 font-sans selection:bg-gold/30 overflow-hidden">
            {/* BACKGROUND IMAGE - Always Visible */}
            <div className="absolute inset-0 z-0">
                <img src={luxuryHero} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
            </div>

            {/* CONTENT LAYER */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end md:justify-center md:items-center">

                {step > 0 && (
                    <div className="absolute top-6 left-6 z-50">
                        <button onClick={() => setStep(prev => prev - 1)} className="p-3 bg-slate-900/50 backdrop-blur rounded-full text-white border border-white/10">
                            <ArrowLeft />
                        </button>
                    </div>
                )}

                {/* Mobile: Full height, Desktop: Phone container */}
                <div className="w-full h-full md:w-[400px] md:h-[800px] md:rounded-[2.5rem] md:overflow-hidden md:border-[8px] md:border-slate-800 md:shadow-2xl relative">
                    {step === 0 && <Step0_Splash />}
                    {/* Steps 1-4 take up mostly bottom half/sheet style */}
                    {step === 1 && <Step1_Services />}
                    {step === 2 && <Step2_Date />}
                    {step === 3 && <Step3_Details />}
                    {step === 4 && <Step4_Success />}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
