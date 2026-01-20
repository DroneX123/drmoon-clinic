import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check, ChevronDown, Calendar, Clock, AlertCircle, ShoppingBag, User } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MoonMenuIcon from '../components/MoonMenuIcon';
import PhoneInput from '../components/PhoneInput';
import { groupServicesByCategory, formatDateForConvex } from '../utils/convexHelpers';

// Assets
import luxuryHero from '../assets/luxury_hero.png'; // Make sure this file exists

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
        if (!value.trim()) {
            setInstagramError(''); // Allow empty while typing, validate on submit/blur if strict
            return false;
        }
        const atPattern = /^@[a-zA-Z0-9._]+$/;
        const urlPattern = /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+/;
        return atPattern.test(value) || urlPattern.test(value);
    };

    const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, instagram: val });
        if (val && !validateInstagram(val)) setInstagramError('Format: @pseudo ou lien');
        else setInstagramError('');
    };

    // --- SUBMISSION ---
    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const serviceIds = selectedTreatments
                .map(name => services.find(s => s.name === name)?._id)
                .filter(Boolean) as Id<"services">[];

            if (!selectedDate) throw new Error("Date manquante");
            if (!formData.instagram || instagramError) throw new Error("Instagram invalide");

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
            const isValid = formData.firstName && formData.lastName && isPhoneValid && formData.instagram && !instagramError;
            if (isValid) handleFinalSubmit();
            return;
        }
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (step > 0 && step < 4) setStep(prev => prev - 1);
        else navigate(-1);
    };

    // --- STEPS COMPONENTS ---

    // STEP 0: WELCOME
    const StepWelcome = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-700">
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6 leading-tight">
                L'Art de <br /> <span className="text-gold italic">L'Esthétique</span>
            </h1>
            <p className="text-white/60 font-light mb-12 max-w-md mx-auto leading-relaxed">
                Réservez votre moment d'exception. Une expérience sur mesure dédiée à votre beauté et votre bien-être.
            </p>
            <button
                onClick={() => setStep(1)}
                className="group relative px-10 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-gold hover:border-gold hover:text-slate-900 transition-all duration-500"
            >
                <span className="font-bold uppercase tracking-[0.2em] text-sm">Commencer</span>
            </button>
        </div>
    );

    // STEP 1: SERVICES
    const StepServices = () => (
        <div className="p-6 md:p-12 animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-serif text-3xl text-white mb-2">Carte des Soins</h2>
            <p className="text-white/40 text-sm mb-8 font-light">Sélectionnez vos traitements préférés.</p>

            <div className="space-y-4 mb-24">
                {RITUALS.map((ritual) => (
                    <div key={ritual.id} className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === ritual.id ? null : ritual.id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                        >
                            <span className="font-serif text-lg text-white/90">{ritual.title}</span>
                            <ChevronDown className={`h-4 w-4 text-gold transition-transform duration-300 ${expandedCategory === ritual.id ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-300 overflow-hidden ${expandedCategory === ritual.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-5 pt-0 space-y-3">
                                {ritual.treatments.map((t, idx) => {
                                    const isSelected = selectedTreatments.includes(t.name);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setSelectedTreatments(prev =>
                                                    prev.includes(t.name) ? prev.filter(x => x !== t.name) : [...prev, t.name]
                                                );
                                            }}
                                            className={`flex justify-between items-center p-4 rounded-xl cursor-pointer border transition-all duration-300
                                                ${isSelected ? 'bg-gold border-gold text-slate-900 shadow-lg shadow-gold/20' : 'bg-transparent border-white/10 text-white/60 hover:border-white/30'}
                                            `}
                                        >
                                            <div className="flex-1">
                                                <p className={`font-bold text-sm mb-1 ${isSelected ? 'text-slate-900' : 'text-white'}`}>{t.name}</p>
                                                <p className={`text-xs ${isSelected ? 'text-slate-800' : 'text-gold'}`}>{t.price}</p>
                                            </div>
                                            {isSelected && <Check className="h-5 w-5 text-slate-900" />}
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

    // STEP 2: CALENDAR
    const StepCalendar = () => {
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;
        const today = new Date(); today.setHours(0, 0, 0, 0);

        return (
            <div className="p-6 md:p-12 animate-in slide-in-from-right-8 duration-500">
                <h2 className="font-serif text-3xl text-white mb-2">Vos Disponibilités</h2>
                <p className="text-white/40 text-sm mb-8 font-light">Choisissez la date qui vous convient.</p>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-8">
                        <span className="font-serif text-2xl text-gold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><ChevronLeft size={20} /></button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-4 text-center text-xs font-bold text-white/30">
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
                                    className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all relative
                                        ${isPast ? 'text-white/10 cursor-not-allowed' : 'hover:bg-white/10 text-white/80'}
                                        ${isSelected ? 'bg-gold text-slate-900 font-bold scale-110 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : ''}
                                    `}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {selectedDate && (
                    <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-gold font-serif text-lg">Disponible à partir de :</p>
                        <p className="text-white/60 text-xs mt-1 uppercase tracking-wider">L'heure sera confirmée par téléphone</p>
                    </div>
                )}
            </div>
        );
    };

    // STEP 3: DETAILS
    const StepDetails = () => (
        <div className="p-6 md:p-12 animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-serif text-3xl text-white mb-2">Vos Coordonnées</h2>
            <p className="text-white/40 text-sm mb-8 font-light">Dernière étape pour valider votre rendez-vous.</p>

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-1">Prénom</label>
                        <input
                            value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/20"
                            placeholder="Votre prénom"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-1">Nom</label>
                        <input
                            value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/20"
                            placeholder="Votre nom"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-1">Téléphone</label>
                    <PhoneInput value={formData.phone} onChange={(v, isValid) => { setFormData({ ...formData, phone: v }); setIsPhoneValid(isValid); }} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/80 tracking-widest pl-1">Instagram <span className="text-[9px] opacity-60">*Obligatoire</span></label>
                    <input
                        value={formData.instagram} onChange={handleInstagramChange}
                        className={`w-full bg-white/5 border rounded-xl p-3 text-white focus:outline-none transition-all placeholder:text-white/20 ${instagramError ? 'border-red-500/50' : 'border-white/10 focus:border-gold'}`}
                        placeholder="@votre_pseudo"
                    />
                    {instagramError && <p className="text-red-400 text-xs pl-1">{instagramError}</p>}
                </div>

                <div className="space-y-2 pt-2">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-1">Demande Spéciale (Optionnel)</label>
                    <textarea
                        rows={3}
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                        placeholder="Allergies, notes..."
                    />
                </div>
            </div>

            {errorMessage && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {errorMessage}
                </div>
            )}
        </div>
    );

    // STEP 4: SUCCESS
    const StepSuccess = () => (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-6 border border-gold/20">
                <Check className="w-8 h-8 text-gold" />
            </div>
            <h2 className="font-serif text-4xl text-white mb-4">Confirmé</h2>
            <p className="text-white/60 mb-8 max-w-sm leading-relaxed">
                Merci {formData.firstName}.<br />Votre demande a été reçue. Nous vous contacterons prochainement pour confirmer l'horaire.
            </p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition-all">
                Retour à l'accueil
            </button>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-950 font-sans selection:bg-gold/30 overflow-hidden">

            {/* LEFT COLUMN: HERO IMAGE */}
            <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10" />
                <div className="absolute inset-0 bg-slate-900/20 z-10" /> {/* Dimmer */}
                <img
                    src={luxuryHero}
                    alt="Luxury Spa"
                    className="w-full h-full object-cover animate-in fade-in duration-1000 scale-[1.02]"
                />

                {/* Branding on Image */}
                <div className="absolute top-10 left-10 z-20">
                    <MoonMenuIcon className="w-12 h-12 text-gold opacity-90 drop-shadow-lg" />
                </div>

                {/* Quote/Text on Image bottom */}
                <div className="absolute bottom-12 left-12 z-20 max-w-md">
                    <p className="font-serif text-3xl text-white leading-tight drop-shadow-md">
                        "La beauté commence au moment où vous décidez d'être vous-même."
                    </p>
                    <p className="text-gold mt-4 uppercase tracking-[0.2em] text-xs font-bold">Cabinet Dr. Berrim</p>
                </div>
            </div>

            {/* RIGHT COLUMN: WIZARD CONTENT */}
            <div className={`w-full lg:w-1/2 h-full flex flex-col relative transition-all duration-500 ${step === 0 ? 'bg-slate-950' : 'bg-slate-950'}`}>

                {/* Top Nav (Except on Welcome & Success) */}
                {step > 0 && step < 4 && (
                    <div className="absolute top-0 left-0 w-full p-6 lg:p-10 flex justify-between items-center z-20 pointer-events-none">
                        <button onClick={handleBack} className="pointer-events-auto p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>

                        {/* Progress Dots */}
                        <div className="flex gap-2">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`w-2 h-2 rounded-full transition-all duration-500 ${s === step ? 'bg-gold w-6' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Scrollable Area */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col ${step > 0 ? 'pt-24' : ''}`}>
                    {step === 0 && <StepWelcome />}
                    {step === 1 && <StepServices />}
                    {step === 2 && <StepCalendar />}
                    {step === 3 && <StepDetails />}
                    {step === 4 && <StepSuccess />}
                </div>

                {/* Bottom Action Bar (Steps 1, 2, 3) */}
                {step > 0 && step < 4 && (
                    <div className="p-6 lg:p-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-white/40 uppercase tracking-widest">Total Estimé</span>
                                <span className="font-serif text-2xl text-gold">{totalPrice.toLocaleString()} DA</span>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && selectedTreatments.length === 0) ||
                                    (step === 2 && !selectedDate) ||
                                    (step === 3 && isSubmitting)
                                }
                                className={`px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all
                                    ${((step === 1 && selectedTreatments.length > 0) || (step === 2 && selectedDate) || (step === 3))
                                        ? 'bg-gold text-slate-900 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-white'
                                        : 'bg-white/10 text-white/20 cursor-not-allowed'
                                    }
                                `}
                            >
                                {step === 3 ? (isSubmitting ? 'Envoi...' : 'Confirmer') : 'Suivant'}
                                {!isSubmitting && <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
