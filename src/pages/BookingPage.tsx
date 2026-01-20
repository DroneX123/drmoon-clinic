import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check, ChevronDown, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MoonMenuIcon from '../components/MoonMenuIcon';
import PhoneInput from '../components/PhoneInput';
import { groupServicesByCategory, formatDateForConvex } from '../utils/convexHelpers';

// Assets
import bgDefault from '../assets/luxury_hero.png';
import bgVisage from '../assets/bg_visage.png';
import bgCorps from '../assets/bg_corps.png';
import bgPeau from '../assets/bg_peau.png';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();

    // --- CONVEX STATE ---
    const services = useQuery(api.services.getAllServices) || [];
    const createAppointment = useMutation(api.appointments.createAppointment);

    // --- WIZARD STATE ---
    // Start directly at Step 1 (Services)
    const [step, setStep] = useState(1);

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
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // Dynamic Background State
    const [currentBg, setCurrentBg] = useState(bgDefault);

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

    // --- DYNAMIC BACKGROUND LOGIC ---
    useEffect(() => {
        // Change background based on Expanded Category OR Selection (Priority to expanded for browsing)
        if (expandedCategory) {
            const catTitle = RITUALS.find(r => r.id === expandedCategory)?.title.toLowerCase() || '';
            if (catTitle.includes('visage')) setCurrentBg(bgVisage);
            else if (catTitle.includes('corps')) setCurrentBg(bgCorps);
            else if (catTitle.includes('peau') || catTitle.includes('skin')) setCurrentBg(bgPeau);
            else setCurrentBg(bgDefault);
        } else if (selectedTreatments.length > 0) {
            // Fallback to the category of the last selected treatment
            const lastTreatment = selectedTreatments[selectedTreatments.length - 1];
            let foundCat = '';
            for (const r of RITUALS) {
                if (r.treatments.some(t => t.name === lastTreatment)) {
                    foundCat = r.title.toLowerCase();
                    break;
                }
            }
            if (foundCat.includes('visage')) setCurrentBg(bgVisage);
            else if (foundCat.includes('corps')) setCurrentBg(bgCorps);
            else if (foundCat.includes('peau') || foundCat.includes('skin')) setCurrentBg(bgPeau);
            else setCurrentBg(bgDefault);
        } else {
            setCurrentBg(bgDefault);
        }
    }, [expandedCategory, selectedTreatments, RITUALS]);


    // Validation & Handlers
    const validateInstagram = (value: string) => {
        if (!value.trim()) return false;
        const atPattern = /^@[a-zA-Z0-9._]+$/;
        const urlPattern = /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+/;
        return atPattern.test(value) || urlPattern.test(value);
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

            if (!selectedDate) throw new Error("Veuillez sélectionner une date.");

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
        if (step === 2 && !selectedDate) {
            setErrorMessage("Veuillez choisir une date.");
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
        <div className="flex items-center gap-2 mb-8 px-2 relative z-10">
            {[1, 2, 3].map((s) => {
                const isActive = step >= s;
                return (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300
                            ${isActive ? 'bg-gold border-gold text-slate-900' : 'bg-transparent border-white/20 text-white/30'}
                        `}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-8 h-px mx-2 transition-colors ${step > s ? 'bg-gold' : 'bg-white/10'}`} />}
                    </div>
                )
            })}
            <div className="ml-auto flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                    {step === 1 ? 'Soins' : step === 2 ? 'Date' : 'Infos'}
                </span>
                <span className="text-[10px] text-white/30">Étape {step} / 3</span>
            </div>
        </div>
    );

    const Step1_Services = () => (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 -mr-2">
                {RITUALS.map((ritual) => (
                    <div key={ritual.id} className="border border-white/5 rounded-xl bg-slate-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:bg-slate-900/60">
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === ritual.id ? null : ritual.id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
                        >
                            <span className="font-serif text-lg text-white/90 group-hover:text-gold transition-colors">{ritual.title}</span>
                            <ChevronDown className={`h-4 w-4 text-gold/50 transition-transform duration-300 ${expandedCategory === ritual.id ? 'text-gold rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-300 overflow-hidden ${expandedCategory === ritual.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-5 pt-0 space-y-2">
                                {ritual.treatments.map((t, idx) => {
                                    const isSelected = selectedTreatments.includes(t.name);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setSelectedTreatments(prev => prev.includes(t.name) ? prev.filter(x => x !== t.name) : [...prev, t.name]) }}
                                            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all duration-200
                                                ${isSelected ? 'bg-gold border-gold text-slate-900 shadow-md translate-x-1' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'}
                                            `}
                                        >
                                            <div className="flex-1">
                                                <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-slate-900' : 'text-white'}`}>{t.name}</p>
                                                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-800' : 'text-gold'}`}>{t.price}</p>
                                            </div>
                                            {isSelected && <Check className="h-4 w-4 text-slate-900" />}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-white/50 text-xs uppercase tracking-wider">Total</span>
                <span className="text-gold font-serif text-2xl">{totalPrice.toLocaleString()} DA</span>
            </div>
        </div>
    );

    const Step2_Date = () => {
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const startOffset = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() || 7) - 1;
        const today = new Date(); today.setHours(0, 0, 0, 0);

        return (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-inner mb-4">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5"><ArrowLeft size={18} /></button>
                        <span className="font-serif text-lg md:text-xl text-gold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
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
                                    onClick={() => setSelectedDate(date)}
                                    className={`aspect-square flex items-center justify-center rounded-full text-xs md:text-sm font-medium transition-all
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

                {selectedDate && (
                    <div className="mx-auto px-6 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold font-serif animate-in fade-in zoom-in">
                        {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                )}
            </div>
        );
    }

    const Step3_Details = () => (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Prénom</label>
                        <input
                            value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-all placeholder:text-white/20 text-sm"
                            placeholder="Prénom"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Nom</label>
                        <input
                            value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-all placeholder:text-white/20 text-sm"
                            placeholder="Nom"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Téléphone</label>
                    <PhoneInput value={formData.phone} onChange={(v, isValid) => { setFormData({ ...formData, phone: v }); setIsPhoneValid(isValid); }} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-gold/80 uppercase font-bold pl-1">Instagram <span className="opacity-50 text-[9px]">*Requis</span></label>
                    <div className="relative">
                        <input
                            value={formData.instagram} onChange={handleInstagramChange}
                            className={`w-full bg-slate-900/60 border rounded-xl p-3 pl-10 text-white focus:outline-none transition-all placeholder:text-white/20 text-sm ${instagramError ? 'border-red-500/50' : 'border-white/10 focus:border-gold'}`}
                            placeholder="pseudo"
                        />
                        <span className="absolute left-3 top-3 text-white/40">@</span>
                    </div>
                </div>

                <div className="bg-slate-900/40 rounded-xl p-4 mt-6 border border-white/5">
                    <div className="flex justify-between text-sm text-white/90">
                        <span>Total (Payable sur place)</span>
                        <span className="font-bold text-gold">{totalPrice.toLocaleString()} DA</span>
                    </div>
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
                className="text-gold border-b border-gold/30 hover:border-gold pb-1 text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
            >
                Retour à l'accueil
            </button>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className="fixed inset-0 bg-slate-950 font-sans selection:bg-gold/30 text-white overflow-hidden flex">

            {/* 1. LAYOUT: LEFT CARD (Fixed Width) */}
            <div className="w-full md:w-[480px] h-full bg-slate-950/95 backdrop-blur-xl border-r border-white/10 flex flex-col relative z-20 shadow-2xl">

                {/* Header */}
                <div className="p-6 md:p-8 flex justify-between items-center bg-slate-950">
                    <div className="flex items-center gap-3">
                        <div onClick={() => navigate('/')} className="cursor-pointer hover:scale-105 transition-transform">
                            <MoonMenuIcon className="h-8 w-8 text-gold" />
                        </div>
                        <div>
                            <h1 className="font-serif text-xl text-white leading-none">Dr. Moon</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Clinic</p>
                        </div>
                    </div>
                    {step > 1 && step < 4 && (
                        <button onClick={() => setStep(prev => prev - 1)} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                </div>

                {/* Wizard Content */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Stepper only for active steps */}
                    {step < 4 && (
                        <div className="px-6 md:px-8 mb-4">
                            <Stepper />
                        </div>
                    )}

                    {/* Step Components */}
                    <div className="flex-1 overflow-hidden px-6 md:px-8 pb-4 relative">
                        {step === 1 && <Step1_Services />}
                        {step === 2 && <Step2_Date />}
                        {step === 3 && <Step3_Details />}
                        {step === 4 && <StepSuccess />}
                    </div>

                    {/* Footer Actions */}
                    {step < 4 && (
                        <div className="p-6 md:p-8 pt-4 border-t border-white/5 bg-slate-950">
                            {errorMessage && (
                                <div className="mb-4 text-center text-red-400 text-xs flex items-center justify-center gap-1 animate-in fade-in">
                                    <AlertCircle size={12} /> {errorMessage}
                                </div>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gold hover:bg-white text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-gold/10 hover:shadow-gold/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                            >
                                {isSubmitting ? <span className="animate-pulse">Patientez...</span> : (step === 3 ? 'Confirmer' : 'Suivant')}
                                {!isSubmitting && step !== 3 && <ChevronRight size={16} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. LAYOUT: RIGHT BACKGROUND (Flexible) */}
            <div className="hidden md:block flex-1 h-full relative overflow-hidden bg-black">
                {/* Dynamic Image Layer with Crossfade */}
                <div key={currentBg} className="absolute inset-0 animate-in fade-in duration-1000">
                    <img
                        src={currentBg}
                        alt="Atmosphere"
                        className="w-full h-full object-cover object-center scale-105 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-950/20 to-slate-950" />
                </div>

                {/* Branding/Quote Overlay */}
                <div className="absolute bottom-12 right-12 text-right max-w-md pointer-events-none">
                    <p className="text-white/90 font-serif text-4xl leading-tight drop-shadow-2xl">
                        "Révélez votre lumière."
                    </p>
                    <div className="h-1 w-20 bg-gold ml-auto mt-6" />
                </div>
            </div>

            {/* Mobile Background (Absolute behind card on mobile) */}
            <div className="md:hidden absolute inset-0 -z-10">
                <img src={currentBg} className="w-full h-full object-cover opacity-60" />
            </div>

        </div>
    );
};

export default BookingPage;
