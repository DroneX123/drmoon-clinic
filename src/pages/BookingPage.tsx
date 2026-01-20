import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MoonMenuIcon from '../components/MoonMenuIcon';
import PhoneInput from '../components/PhoneInput';
import { groupServicesByCategory, formatDateForConvex } from '../utils/convexHelpers';

// Assets
import bgDefault from '../assets/luxury_hero.png';
import bgVisage from '../assets/visage_blonde.png';
import bgCorps from '../assets/body_fit.png';
import bgPeau from '../assets/bg_peau.png';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();

    // --- CONVEX STATE ---
    const services = useQuery(api.services.getAllServices) || [];
    const createAppointment = useMutation(api.appointments.createAppointment);

    // --- WIZARD STATE ---
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [activeTabId, setActiveTabId] = useState<string>('visage');
    const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '+213',
        email: '',
        instagram: '',
        description: '' // Used for client message
    });

    // --- DATA STATE ---
    const [currentDate, setCurrentDate] = useState(new Date());

    // UI States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [instagramError, setInstagramError] = useState('');
    const [currentBg, setCurrentBg] = useState(bgDefault);
    const [searchParams] = useSearchParams();

    // Helpers
    const RITUALS = useMemo(() => groupServicesByCategory(services), [services]);
    const totalPrice = useMemo(() => {
        let total = 0;
        selectedTreatments.forEach(name => {
            const svc = services.find(s => s.name === name);
            if (svc) {
                const priceVal = (svc as any).price;
                if (typeof priceVal === 'number') {
                    total += priceVal;
                } else if (typeof priceVal === 'string' && !priceVal.toLowerCase().includes('offert')) {
                    const val = parseInt(priceVal.replace(/\D/g, ''), 10);
                    if (!isNaN(val)) total += val;
                }
            }
        });
        return total;
    }, [selectedTreatments, services]);

    // Initialize Active Tab from URL params or default
    useEffect(() => {
        if (RITUALS.length > 0 && !activeTabId) {
            const categoryParam = searchParams.get('category');
            if (categoryParam) {
                // Try to match exact ID or case-insensitive
                const match = RITUALS.find(r => r.id.toLowerCase() === categoryParam.toLowerCase());
                if (match) setActiveTabId(match.id);
                else setActiveTabId(RITUALS[0].id);
            } else {
                setActiveTabId(RITUALS[0].id);
            }
        }
    }, [RITUALS, activeTabId, searchParams]);

    // --- DYNAMIC BACKGROUND & TAB LOGIC ---
    useEffect(() => {
        if (activeTabId && RITUALS.length > 0) {
            const currentCat = RITUALS.find(r => r.id === activeTabId);
            if (currentCat) {
                const title = currentCat.id.toLowerCase(); // Use ID for safer matching
                if (title.includes('visage')) setCurrentBg(bgVisage);
                else if (title.includes('corps')) setCurrentBg(bgCorps);
                else if (title.includes('peau') || title.includes('skin')) setCurrentBg(bgPeau);
                else setCurrentBg(bgDefault);
            }
        } else {
            setCurrentBg(bgDefault);
        }
    }, [activeTabId, RITUALS]);


    // Validation & Handlers
    const validateInstagram = (value: string) => {
        // Less strict: just check if it's not empty and has length
        return value.trim().length > 1;
    };

    const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, instagram: val });
        if (val && !validateInstagram(val)) setInstagramError('Pseudo invalide');
        else setInstagramError('');
    };

    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            if (!formData.firstName || !formData.lastName) throw new Error("Veuillez remplir votre nom et prénom.");
            if (!formData.instagram || instagramError) throw new Error("Instagram valide requis.");

            const serviceIds = selectedTreatments
                .map(name => services.find(s => s.name === name)?._id)
                .filter(Boolean) as Id<"services">[];

            if (!selectedDate || !selectedTime) throw new Error("Veuillez sélectionner une date et une heure.");

            await createAppointment({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email || undefined,
                instagram: formData.instagram,
                serviceIds,
                date: formatDateForConvex(selectedDate),
                time: selectedTime || "09:00",
                clientMessage: formData.description || undefined,
            });
            setStep(4);
        } catch (error: any) {
            setErrorMessage(error.message || "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        setErrorMessage('');
        if (step === 1 && selectedTreatments.length === 0) {
            setErrorMessage("Veuillez choisir au moins un soin.");
            return;
        }
        if (step === 2 && (!selectedDate || !selectedTime)) {
            setErrorMessage("Veuillez choisir une date et une heure.");
            return;
        }
        if (step === 3) {
            handleFinalSubmit();
            return;
        }
        setStep(prev => prev + 1);
    };

    // --- SUB-COMPONENTS ---

    const Stepper = () => (
        <div className="flex items-center gap-2 mb-6 px-2 relative z-10 justify-center">
            {[1, 2, 3].map((s) => {
                const isActive = step >= s;
                return (
                    <div key={s} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300
                            ${isActive ? 'bg-gold border-gold text-slate-900 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-transparent border-white/20 text-white/30'}
                        `}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-6 h-px mx-1 transition-colors ${step > s ? 'bg-gold' : 'bg-white/10'}`} />}
                    </div>
                )
            })}
        </div>
    );

    const Step1_Services = () => (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">

            {/* TABS HEADER */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                {RITUALS.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTabId(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border
                            ${activeTabId === cat.id
                                ? 'bg-gold border-gold text-slate-900 shadow-lg shadow-gold/20'
                                : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'}
                        `}
                    >
                        {cat.title}
                    </button>
                ))}
            </div>

            {/* SERVICE LIST (For Active Tab) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 -mr-2">
                {RITUALS.find(r => r.id === activeTabId)?.treatments.map((t, idx) => {
                    const isSelected = selectedTreatments.includes(t.name);
                    return (
                        <div
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setSelectedTreatments(prev => prev.includes(t.name) ? prev.filter(x => x !== t.name) : [...prev, t.name]) }}
                            className={`flex justify-between items-center p-4 rounded-xl cursor-cursor-pointer border transition-all duration-200
                                 ${isSelected
                                    ? 'bg-gradient-to-r from-gold/20 to-gold/5 border-gold/50 text-white shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                    : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}
                             `}
                        >
                            <div className="flex-1">
                                <p className={`font-serif text-sm leading-tight ${isSelected ? 'text-gold' : 'text-white'}`}>{t.name}</p>
                                <p className={`text-[10px] mt-1 font-mono tracking-widest ${isSelected ? 'text-white/80' : 'text-white/30'}`}>{t.price}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-gold border-gold' : 'border-white/20'}`}>
                                {isSelected && <Check className="w-3 h-3 text-slate-900" />}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Sélection</span>
                <span className="text-gold font-serif text-xl">{totalPrice.toLocaleString()} DA</span>
            </div>
        </div>
    );

    const Step2_Date = () => {
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const startOffset = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() || 7) - 1;
        const today = new Date(); today.setHours(0, 0, 0, 0);

        return (
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 backdrop-blur-sm shadow-inner mb-4">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5"><ArrowLeft size={18} /></button>
                        <span className="font-serif text-lg text-gold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5"><ArrowLeft size={18} className="rotate-180" /></button>
                    </div>

                    <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold text-white/30 uppercase tracking-wider">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <span key={d}>{d}</span>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const d = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                            const isPast = date < today;
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            return (
                                <button
                                    key={d}
                                    disabled={isPast}
                                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                                    className={`aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-all
                                        ${isSelected ? 'bg-gold text-slate-900 shadow-lg shadow-gold/40 scale-110' :
                                            isPast ? 'text-white/5 cursor-not-allowed' : 'bg-white/5 text-white hover:bg-white/10'}
                                    `}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-white/40 text-[10px] uppercase font-bold mb-3 pl-1">Horaires Disponibles</h3>
                        <div className="grid grid-cols-4 gap-2 pb-2">
                            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all
                                        ${selectedTime === time
                                            ? 'bg-gold border-gold text-slate-900 shadow-md'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                                    `}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        <div className="mx-auto mt-4 px-6 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold font-serif text-sm text-center">
                            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            {selectedTime && <span className="ml-1">à {selectedTime}</span>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const Step3_Details = () => (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Prénom</label>
                        <input
                            value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-all placeholder:text-white/20 text-sm"
                            placeholder="Votre prénom"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Nom</label>
                        <input
                            value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-all placeholder:text-white/20 text-sm"
                            placeholder="Votre nom"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Téléphone</label>
                    <PhoneInput value={formData.phone} onChange={(v, _) => { setFormData({ ...formData, phone: v }); }} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-gold/80 uppercase font-bold pl-1">Instagram <span className="opacity-50 text-[9px]">*Requis</span></label>
                    <div className="relative">
                        <input
                            value={formData.instagram} onChange={handleInstagramChange}
                            className={`w-full bg-slate-900/60 border rounded-xl p-3 pl-10 text-white focus:outline-none transition-all placeholder:text-white/20 text-sm ${instagramError ? 'border-red-500/50' : 'border-white/10 focus:border-gold'}`}
                            placeholder="votre_pseudo"
                        />
                        <span className="absolute left-3 top-3 text-white/40">@</span>
                    </div>
                </div>

                <div className="bg-slate-900/40 rounded-xl p-4 mt-6 border border-white/5 flex justify-between items-center">
                    <span className="text-white/60 text-xs uppercase tracking-wider">Total à régler</span>
                    <span className="font-serif text-xl text-gold">{totalPrice.toLocaleString()} DA</span>
                </div>
            </div>
        </div>
    );

    const StepSuccess = () => (
        <div className="h-full flex flex-col justify-center items-center text-center p-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(212,175,55,0.5)]">
                <Check className="w-8 h-8 text-slate-900 stroke-[3]" />
            </div>
            <h2 className="font-serif text-3xl text-white mb-2">Confirmé</h2>
            <p className="text-white/60 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                Merci {formData.firstName}.<br />Nous vous contacterons très vite pour valider l'horaire.
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white/5 hover:bg-gold text-white hover:text-slate-900 rounded-full transition-all text-xs uppercase tracking-widest font-bold border border-white/10"
            >
                Retour à l'accueil
            </button>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className="fixed inset-0 bg-slate-950 font-sans selection:bg-gold/30 text-white overflow-hidden flex items-center justify-center">

            {/* BACKGROUND: Full Screen with Overlay */}
            <div className="absolute inset-0 z-0 bg-black">
                {[bgDefault, bgVisage, bgCorps, bgPeau].map((imgSrc) => (
                    <div
                        key={imgSrc}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentBg === imgSrc ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={imgSrc}
                            alt="Atmosphere"
                            className="w-full h-full object-cover object-left scale-105"
                        />
                        {/* THE "FADE" OVERLAY - Conditional darkness */}
                        <div className={`absolute inset-0 backdrop-blur-[2px] transition-all duration-1000 ${imgSrc === bgPeau ? 'bg-slate-950/70' : 'bg-slate-950/40'
                            }`} />
                        <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent ${imgSrc === bgPeau ? 'to-slate-950/50' : 'to-slate-950/20'
                            }`} />
                    </div>
                ))}
            </div>

            {/* HEADER (Floating) */}
            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center">
                <div onClick={() => navigate('/')} className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-3">
                    <MoonMenuIcon className="h-8 w-8 text-gold drop-shadow-md" />
                </div>
                {step > 1 && step < 4 && (
                    <button onClick={() => setStep(prev => prev - 1)} className="p-2 rounded-full bg-slate-900/50 hover:bg-white/10 text-white border border-white/10 transition-colors backdrop-blur">
                        <ArrowLeft size={20} />
                    </button>
                )}
            </div>

            {/* CENTRAL CARD */}
            <div className="relative z-20 w-full max-w-md h-[85vh] max-h-[800px] flex flex-col">
                <div className="flex-1 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-500">

                    {/* Card Header (Steps) */}
                    {step < 4 && (
                        <div className="pt-8 pb-4 border-b border-white/5">
                            <h2 className="text-center font-serif text-2xl text-white mb-4">
                                {step === 1 ? 'Vos Soins' : step === 2 ? 'Votre Date' : 'Vos Infos'}
                            </h2>
                            <Stepper />
                        </div>
                    )}

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-hidden px-6 md:px-8 pb-4 relative">
                        {step === 1 && <Step1_Services />}
                        {step === 2 && <Step2_Date />}
                        {step === 3 && <Step3_Details />}
                        {step === 4 && <StepSuccess />}
                    </div>

                    {/* Footer Actions */}
                    {step < 4 && (
                        <div className="p-6 md:p-8 pt-4 border-t border-white/5 bg-slate-950/50">
                            {errorMessage && (
                                <div className="mb-4 text-center text-red-300 text-xs flex items-center justify-center gap-1 animate-in fade-in">
                                    <AlertCircle size={12} /> {errorMessage}
                                </div>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-gold to-amber-400 hover:from-white hover:to-white text-slate-900 font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2 uppercase tracking-widest text-sm transform hover:-translate-y-1"
                            >
                                {isSubmitting ? <span className="animate-pulse">Patientez...</span> : (step === 3 ? 'Confirmer' : 'Suivant')}
                                {!isSubmitting && step !== 3 && <ChevronRight size={16} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default BookingPage;
