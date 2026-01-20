import React, { useState, useMemo } from 'react';
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
    // 0: Welcome, 1: Services, 2: Calendar, 3: Details, 4: Confirmation/Success
    const [step, setStep] = useState(0);

    // --- FORM DATA STATE ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '+213',
        email: '',
        instagram: '',
        description: ''
    });

    // --- UI STATE ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [instagramError, setInstagramError] = useState('');
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // --- HELPERS ---
    const RITUALS = useMemo(() => groupServicesByCategory(services), [services]);

    const calculateTotal = () => {
        let total = 0;
        selectedTreatments.forEach(treatmentName => {
            for (const ritual of RITUALS) {
                const treatment = ritual.treatments.find(t => t.name === treatmentName);
                if (treatment) {
                    const priceStr = treatment.price;
                    if (priceStr.toLowerCase().includes('offert')) continue;
                    const match = priceStr.match(/(\d[\d\s]*)/);
                    if (match) {
                        const value = parseInt(match[0].replace(/\s/g, ''), 10);
                        if (!isNaN(value)) total += value;
                    }
                }
            }
        });
        return total;
    };
    const totalPrice = calculateTotal();

    const validateInstagram = (value: string) => {
        if (!value.trim()) return false;
        const atPattern = /^@[a-zA-Z0-9._]+$/;
        const urlPattern = /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+/;
        return atPattern.test(value) || urlPattern.test(value);
    };

    const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, instagram: val });
        if (val && !validateInstagram(val)) setInstagramError('Format: @pseudo ou lien requis');
        else setInstagramError('');
    };

    // --- SUBMISSION ---
    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            // Basic Validation
            if (!formData.firstName || !formData.lastName) throw new Error("Nom et Prénom requis");
            if (!isPhoneValid) throw new Error("Numéro de téléphone invalide");
            if (!formData.instagram || instagramError) throw new Error("Instagram invalide");

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
                serviceIds: serviceIds,
                date: formatDateForConvex(selectedDate),
                time: "09:00", // Placeholder
                clientMessage: formData.description || undefined,
            });

            setStep(4); // Success Step
        } catch (error: any) {
            console.error("Error:", error);
            setErrorMessage(error.message || "Erreur de réservation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- NAVIGATION ---
    const handleNext = () => {
        if (step === 1 && selectedTreatments.length === 0) return;
        if (step === 2 && !selectedDate) return;
        if (step === 3) {
            // Trigger submit if on details step
            handleFinalSubmit();
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 0 && step < 4) setStep(prev => prev - 1);
        else navigate(-1);
    };

    // --- COMPONENTS ---
    const StepWelcome = () => (
        <div className="flex flex-col items-center justify-center text-center h-full animate-in fade-in zoom-in-95 duration-700">
            <div className="mb-8 w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight drop-shadow-lg">
                <span className="block text-2xl md:text-3xl italic text-gold/80 mb-2 font-light">Cabinet Dr. Berrim</span>
                L'Excellence <br /> Esthétique
            </h1>
            <p className="text-white/80 font-light mb-10 max-w-md mx-auto leading-relaxed drop-shadow-md backdrop-blur-sm p-4 rounded-xl border border-white/5 bg-black/20">
                Votre beauté mérite une attention particulière. Réservez votre consultation personnalisée en quelques instants.
            </p>
            <button
                onClick={() => setStep(1)}
                className="group relative px-12 py-4 bg-gold/90 hover:bg-white text-slate-900 font-bold uppercase tracking-[0.2em] text-sm rounded-full transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
            >
                Commencer
            </button>
        </div>
    );

    const StepServices = () => (
        <div className="h-full flex flex-col">
            <div className="text-center mb-6">
                <h2 className="font-serif text-2xl text-white">Carte des Soins</h2>
                <p className="text-gold/60 text-xs uppercase tracking-widest">Étape 1 sur 3</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3">
                {RITUALS.map((ritual) => (
                    <div key={ritual.id} className="border border-white/10 rounded-xl bg-slate-900/50 overflow-hidden backdrop-blur-md transition-all hover:bg-slate-900/80">
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === ritual.id ? null : ritual.id)}
                            className="w-full flex items-center justify-between p-4 px-5 hover:bg-white/5 transition-colors"
                        >
                            <span className="font-serif text-lg text-white/90">{ritual.title}</span>
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
        </div>
    );

    const StepCalendar = () => {
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const startOffset = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() || 7) - 1;
        const today = new Date(); today.setHours(0, 0, 0, 0);

        return (
            <div className="h-full flex flex-col items-center">
                <div className="text-center mb-6">
                    <h2 className="font-serif text-2xl text-white">Disponibilités</h2>
                    <p className="text-gold/60 text-xs uppercase tracking-widest">Étape 2 sur 3</p>
                </div>

                <div className="w-full max-w-sm bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 text-white/50 hover:text-white"><ArrowLeft size={16} /></button>
                        <span className="font-serif text-xl text-gold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 text-white/50 hover:text-white"><ArrowLeft size={16} className="rotate-180" /></button>
                    </div>

                    <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold text-white/30 uppercase tracking-wider">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <span key={d}>{d}</span>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
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
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all mx-auto
                                        ${isPast ? 'text-white/10' : 'hover:bg-white/10 text-white/80'}
                                        ${isSelected ? 'bg-gold text-slate-900 font-bold shadow-[0_0_10px_rgba(212,175,55,0.5)] scale-110' : ''}
                                    `}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {selectedDate && (
                    <div className="mt-8 p-4 bg-gold/10 border border-gold/20 rounded-xl text-center animate-in fade-in slide-in-from-bottom-2 w-full max-w-sm">
                        <p className="text-gold font-serif text-lg flex items-center justify-center gap-2">
                            <Calendar size={18} />
                            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-white/60 text-[10px] mt-1 uppercase tracking-wider">Créneau réservé pour confirmation</p>
                    </div>
                )}
            </div>
        );
    }

    const StepDetails = () => (
        <div className="h-full flex flex-col">
            <div className="text-center mb-6">
                <h2 className="font-serif text-2xl text-white">Vos Coordonnées</h2>
                <p className="text-gold/60 text-xs uppercase tracking-widest">Étape 3 sur 3</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-[10px] text-gold/80 uppercase font-bold pl-1 flex justify-between">Instagram <span className="opacity-50 text-[9px]">*Requis</span></label>
                    <input
                        value={formData.instagram} onChange={handleInstagramChange}
                        className={`w-full bg-slate-900/60 border rounded-xl p-3 text-white focus:outline-none transition-all placeholder:text-white/20 text-sm ${instagramError ? 'border-red-500/50' : 'border-white/10 focus:border-gold'}`}
                        placeholder="@votre_pseudo"
                    />
                    {instagramError && <p className="text-red-400 text-[10px] pl-1">{instagramError}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Note (Optionnel)</label>
                    <textarea rows={2}
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-all placeholder:text-white/20 text-sm resize-none"
                        placeholder="Allergies, préférences..."
                    />
                </div>

                {/* Summary Card */}
                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <p className="text-[10px] text-gold uppercase tracking-widest font-bold border-b border-white/5 pb-2">Récapitulatif</p>
                    <div className="flex justify-between items-center text-sm text-white/80">
                        <span>{selectedTreatments.length} Soin(s)</span>
                        <span className="font-bold">{totalPrice.toLocaleString()} DA</span>
                    </div>
                    {selectedDate && <div className="text-xs text-white/60">📅 {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>}
                </div>
            </div>
        </div>
    );

    const StepSuccess = () => (
        <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                <Check className="w-10 h-10 text-slate-900 stroke-[3]" />
            </div>
            <h2 className="font-serif text-3xl text-white mb-2">Réservation Confirmée</h2>
            <p className="text-gold uppercase tracking-widest text-xs font-bold mb-8">Cabinet Dr. Berrim</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-sm w-full backdrop-blur-md">
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                    Merci <strong>{formData.firstName}</strong>. Votre demande a bien été enregistrée.
                </p>
                <p className="text-white/50 text-xs">
                    Nous vous contacterons très prochainement par téléphone ou Instagram pour confirmer l'horaire exact.
                </p>
            </div>
            <button onClick={() => navigate('/')} className="mt-8 text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors border-b border-transparent hover:border-white">
                Retour à l'accueil
            </button>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans selection:bg-gold/30">
            {/* FULL BACKGROUND IMAGE */}
            <div className="absolute inset-0 z-0">
                <img src={luxuryHero} alt="Background" className="w-full h-full object-cover opacity-60 md:opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 md:bg-slate-950/50 backdrop-blur-[2px]" />
            </div>

            {/* HEADER NAVIGATION */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center pointer-events-none">
                {step > 0 && step < 4 && (
                    <button onClick={handleBack} className="pointer-events-auto p-3 rounded-full bg-slate-900/30 backdrop-blur-md border border-white/10 text-white/70 hover:bg-gold hover:text-slate-900 hover:border-gold transition-all duration-300 group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                )}
                <div className="pointer-events-auto cursor-pointer transition-transform hover:scale-110" onClick={() => navigate('/')}>
                    <MoonMenuIcon className="h-8 w-8 text-gold drop-shadow-md" />
                </div>
            </div>

            {/* CENTRAL WIZARD CARD CONTAINER */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8">

                {step === 0 ? (
                    // Welcome Screen is distinct
                    <div className="w-full max-w-4xl">
                        <StepWelcome />
                    </div>
                ) : (
                    // Wizard Steps Card
                    <div className="w-full max-w-lg h-[85vh] md:h-auto md:max-h-[800px] bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/5">

                        {/* Card Content Area */}

                        {step !== 4 && (
                            // Progress Bar (Top of Card)
                            <div className="flex h-1 bg-white/5 w-full">
                                <div className={`h-full bg-gold transition-all duration-500 ease-in-out ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
                                    }`} />
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden p-6 md:p-8 relative">
                            {step === 1 && <StepServices key="step1" />}
                            {step === 2 && <StepCalendar key="step2" />}
                            {step === 3 && <StepDetails key="step3" />}
                            {step === 4 && <StepSuccess key="step4" />}
                        </div>

                        {/* Card Footer Actions (Only for steps 1-3) */}
                        {step > 0 && step < 4 && (
                            <div className="p-6 md:p-8 pt-4 border-t border-white/5 bg-slate-900/40">
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && selectedTreatments.length === 0) ||
                                        (step === 2 && !selectedDate) ||
                                        (step === 3 && isSubmitting)
                                    }
                                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
                                        ${((step === 1 && selectedTreatments.length > 0) || (step === 2 && selectedDate) || (step === 3))
                                            ? 'bg-gold text-slate-900 hover:bg-white hover:text-slate-900 hover:shadow-gold/20'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                        }
                                    `}
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Traitement...</span>
                                    ) : (
                                        <>
                                            {step === 3 ? 'Confirmer le Rendez-vous' : 'Étape Suivante'}
                                            {step !== 3 && <ChevronRight size={16} />}
                                        </>
                                    )}
                                </button>
                                {errorMessage && (
                                    <div className="mt-3 text-center text-red-400 text-xs flex items-center justify-center gap-1 animate-in fade-in">
                                        <AlertCircle size={12} /> {errorMessage}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
