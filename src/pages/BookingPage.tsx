import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check, ChevronDown, Calendar, AlertCircle, Sparkles, X } from 'lucide-react';
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
    // 0: Welcome, 1: Services, 2: Calendar, 3: Details, 4: Confirmation/Success
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
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
            // Basic Validation
            if (!formData.firstName || !formData.lastName) throw new Error("Veuillez remplir votre nom et prénom.");
            // Relaxed validation for "dumb" flow - try to submit even if phone incomplete if they insist, but UI blocks it
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

            // Move to success step which will trigger navigation eventually
            setStep(4);
        } catch (error: any) {
            console.error(error);
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
        <div className="flex items-center justify-between mb-8 px-4 md:px-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10" />
            {[1, 2, 3].map((s) => {
                const isActive = step >= s;
                const isCurrent = step === s;
                return (
                    <div key={s} className="flex flex-col items-center bg-slate-900 px-2 group">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 transition-all duration-300
                            ${isActive ? 'bg-gold border-gold text-slate-900 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-slate-800 border-white/10 text-white/30'}
                            ${isCurrent ? 'scale-110' : ''}
                        `}>
                            {s === 1 && <Sparkles size={14} />}
                            {s === 2 && <Calendar size={14} />}
                            {s === 3 && <Check size={14} />}
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 hidden md:block transition-colors ${isActive ? 'text-gold' : 'text-white/20'}`}>
                            {s === 1 ? 'Soins' : s === 2 ? 'Date' : 'Infos'}
                        </span>
                    </div>
                )
            })}
        </div>
    );

    const Step1_Services = () => (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h2 className="font-serif text-2xl text-white">Carte des Soins</h2>
                <p className="text-white/40 text-xs mt-1">Sélectionnez vos traitements</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 -mr-2">
                {RITUALS.map((ritual) => (
                    <div key={ritual.id} className="border border-white/5 rounded-xl bg-white/[0.02] overflow-hidden">
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === ritual.id ? null : ritual.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                            <span className="font-serif text-sm md:text-base text-white/90">{ritual.title}</span>
                            <ChevronDown className={`h-4 w-4 text-gold transition-transform duration-300 ${expandedCategory === ritual.id ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-300 overflow-hidden ${expandedCategory === ritual.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 pt-0 space-y-2">
                                {ritual.treatments.map((t, idx) => {
                                    const isSelected = selectedTreatments.includes(t.name);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedTreatments(prev => prev.includes(t.name) ? prev.filter(x => x !== t.name) : [...prev, t.name])}
                                            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all duration-200
                                                ${isSelected ? 'bg-gold border-gold text-slate-900 shadow-md transform scale-[1.01]' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'}
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
            {/* Total sticky footer inside step */}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-white/50 text-xs uppercase tracking-wider">Total Estimé</span>
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
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 items-center">
                <h2 className="font-serif text-2xl text-white mb-6">Disponibilités</h2>

                <div className="w-full max-w-sm bg-slate-900/40 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-inner">
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
                            // STRICTLY DISABLE PAST DATES
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
                    <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="px-6 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold font-serif">
                            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <span className="text-[10px] text-white/40 mt-2 uppercase tracking-wider">Créneau réservé</span>
                    </div>
                )}
            </div>
        );
    }

    const Step3_Details = () => (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h2 className="font-serif text-2xl text-white">Vos Coordonnées</h2>
                <p className="text-white/40 text-xs mt-1">Dernière étape pour valider</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Prénom</label>
                        <input
                            value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-all placeholder:text-white/20 text-sm"
                            placeholder="Votre prénom"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Nom</label>
                        <input
                            value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-all placeholder:text-white/20 text-sm"
                            placeholder="Votre nom"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Téléphone</label>
                    <PhoneInput value={formData.phone} onChange={(v, isValid) => { setFormData({ ...formData, phone: v }); setIsPhoneValid(isValid); }} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-gold/80 uppercase font-bold pl-1 flex justify-between">Instagram <span className="opacity-50 text-[9px]">*Requis</span></label>
                    <div className="relative">
                        <input
                            value={formData.instagram} onChange={handleInstagramChange}
                            className={`w-full bg-white/5 border rounded-xl p-3 pl-10 text-white focus:outline-none transition-all placeholder:text-white/20 text-sm ${instagramError ? 'border-red-500/50' : 'border-white/10 focus:border-gold'}`}
                            placeholder="votre_pseudo"
                        />
                        <span className="absolute left-3 top-3 text-white/40">@</span>
                    </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-4 mt-6 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Récapitulatif</p>
                    <div className="flex justify-between text-sm text-white/90">
                        <span>{selectedTreatments.length} Soins</span>
                        <span className="font-bold text-gold">{totalPrice.toLocaleString()} DA</span>
                    </div>
                    {selectedDate && <div className="text-xs text-white/50 mt-1 capitalize">{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>}
                </div>
            </div>
        </div>
    );

    const StepWelcome = () => (
        <div className="h-full flex flex-col justify-center items-center text-center p-8 animate-in zoom-in-95 duration-700">
            <div className="absolute inset-0 bg-slate-950/20" /> {/* Slight tint */}
            <div className="relative z-10">
                <MoonMenuIcon className="w-16 h-16 text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] mx-auto mb-8 animate-pulse-slow" />
                <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 drop-shadow-xl tracking-tight">
                    Dr. Moon <br /> <span className="text-3xl md:text-4xl italic text-gold font-light">Clinic</span>
                </h1>
                <p className="text-white/90 mb-12 max-w-md mx-auto leading-relaxed shadow-black drop-shadow-md text-lg font-light">
                    L'expertise esthétique dans un écrin de luxe.
                </p>
                <button
                    onClick={() => setStep(1)}
                    className="px-10 py-4 bg-white/10 hover:bg-gold hover:text-slate-900 border border-white/30 hover:border-gold rounded-full backdrop-blur-md transition-all duration-300 font-bold uppercase tracking-[0.2em] text-sm group"
                >
                    Prendre Rendez-vous
                </button>
            </div>
        </div>
    );

    const StepSuccess = () => (
        <div className="h-full flex flex-col justify-center items-center text-center p-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(212,175,55,0.5)] animate-in bounce-in duration-700">
                <Check className="w-10 h-10 text-slate-900 stroke-[3]" />
            </div>
            <h2 className="font-serif text-4xl text-white mb-2">Confirmé</h2>
            <p className="text-white/60 mb-8 max-w-xs mx-auto leading-relaxed">
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
        <div className="fixed inset-0 bg-slate-950 font-sans selection:bg-gold/30 text-white overflow-hidden">
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <img src={luxuryHero} className="w-full h-full object-cover opacity-80" alt="Background" />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
            </div>

            {/* NAVBAR */}
            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
                {step > 0 && step < 4 && (
                    <button onClick={() => setStep(prev => prev - 1)} className="pointer-events-auto p-2 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="ml-auto pointer-events-auto cursor-pointer" onClick={() => navigate('/')}>
                    <MoonMenuIcon className="h-8 w-8 text-gold opacity-80 hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* CENTER WIZARD CARD */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4">

                {step === 0 ? (
                    <StepWelcome />
                ) : (
                    <div className="w-full max-w-lg h-[80vh] md:h-auto md:max-h-[850px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        {/* Header Step Indicator - Only for steps 1-3 */}
                        {step < 4 && (
                            <div className="pt-8 pb-4">
                                <Stepper />
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden px-6 md:px-10 pb-6 relative">
                            {step === 1 && <Step1_Services />}
                            {step === 2 && <Step2_Date />}
                            {step === 3 && <Step3_Details />}
                            {step === 4 && <StepSuccess />}
                        </div>

                        {/* Footer Buttons - Only for steps 1-3 */}
                        {step < 4 && (
                            <div className="p-6 md:p-8 pt-4 border-t border-white/5 bg-slate-900/50">
                                {errorMessage && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-200 text-xs justify-center animate-in fade-in slide-in-from-bottom-2">
                                        <AlertCircle size={14} /> {errorMessage}
                                    </div>
                                )}

                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gold hover:bg-white text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Patientez...</span>
                                    ) : (
                                        <>
                                            {step === 3 ? 'Confirmer' : 'Suivant'}
                                            <ChevronRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
