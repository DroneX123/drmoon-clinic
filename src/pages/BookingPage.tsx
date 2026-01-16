import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, ChevronDown, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import MoonMenuIcon from '../components/MoonMenuIcon';
import PhoneInput from '../components/PhoneInput';
import { groupServicesByCategory, formatDateForConvex } from '../utils/convexHelpers';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();

    // Convex Hooks
    const services = useQuery(api.services.getAllServices) || [];
    const createAppointment = useMutation(api.appointments.createAppointment);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Convert Convex services to RITUALS format for UI
    const RITUALS = useMemo(() => groupServicesByCategory(services), [services]);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Service Selection State
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '+213',
        email: '', // OPTIONAL now
        instagram: '',
        description: ''
    });



    const [instagramError, setInstagramError] = useState<string>('');
    const [isPhoneValid, setIsPhoneValid] = useState(false);

    // Calendar Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for date comparison

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (newDate < today) return; // Prevent selection of past dates logic (though disabled in UI)
        setSelectedDate(newDate);
        setSelectedTime(null);
    };

    // Service Logic
    const toggleTreatment = (treatmentName: string) => {
        setSelectedTreatments(prev =>
            prev.includes(treatmentName)
                ? prev.filter(t => t !== treatmentName)
                : [...prev, treatmentName]
        );
    };

    // Instagram Validation - Accepts all formats
    const validateInstagram = (value: string) => {
        if (!value.trim()) {
            setInstagramError('Instagram requis');
            return false;
        }

        // Accept @username, full URLs, and share links with query params
        const atPattern = /^@[a-zA-Z0-9._]+$/;
        const urlPattern = /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+/; // Allows query params after username

        if (atPattern.test(value) || urlPattern.test(value)) {
            setInstagramError('');
            return true;
        } else {
            setInstagramError('Format invalide (ex: @pseudo ou lien Instagram)');
            return false;
        }
    };

    // Phone Validation logic is handled by PhoneInput component


    const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, instagram: val });
        validateInstagram(val);
    };

    const isFormValid = selectedDate &&
        formData.firstName && formData.lastName &&
        formData.phone && isPhoneValid && // Phone required and valid
        formData.instagram && !instagramError && // Instagram present and valid
        selectedTreatments.length > 0;
    // Price Calculation
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
                        if (!isNaN(value)) {
                            total += value;
                        }
                    }
                }
            }
        });
        return total;
    };

    const totalPrice = calculateTotal();
    const formattedPrice = new Intl.NumberFormat('fr-DZ').format(totalPrice);

    return (
        <div className="min-h-screen w-full bg-slate-950 text-white font-sans selection:bg-gold/30">

            {/* Header / Back Button */}
            <div className="fixed top-0 left-0 z-50 w-full p-6 md:p-8 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="pointer-events-auto group flex items-center gap-3 text-white/60 hover:text-white transition-colors"
                >
                    <div className="rounded-full bg-white/5 p-3 backdrop-blur-md border border-white/10 group-hover:border-gold/30 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </div>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="pointer-events-auto group transition-transform hover:scale-110"
                >
                    <MoonMenuIcon className="h-6 w-6 text-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            <main className="flex min-h-screen flex-col items-center justify-center p-6 py-24 md:p-12">

                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                    {/* LEFT COLUMN: Services & Calendar */}
                    <div className="flex flex-col gap-8 animate-in slide-in-from-left-8 duration-700 fade-in">

                        <div className="space-y-2">
                            <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Réserver</h1>
                            <p className="text-white/40 font-light tracking-wide">Composez votre rituel beauté.</p>
                        </div>

                        {/* 1. SERVICE SELECTION ACCORDION */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-2">Choix du Soin</h3>

                            {RITUALS.map((ritual) => (
                                <div key={ritual.id} className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-all duration-300">
                                    <button
                                        onClick={() => setExpandedCategory(expandedCategory === ritual.id ? null : ritual.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-serif text-lg">{ritual.title}</span>
                                        <ChevronDown className={`h-4 w-4 text-white/50 transition-transform duration-300 ${expandedCategory === ritual.id ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className={`transition-all duration-300 overflow-hidden ${expandedCategory === ritual.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-4 pt-0 space-y-3">
                                            {ritual.treatments.map((treatment, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => toggleTreatment(treatment.name)}
                                                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border
                                                        ${selectedTreatments.includes(treatment.name)
                                                            ? 'bg-gold/10 border-gold/30'
                                                            : 'bg-transparent border-transparent hover:bg-white/5'}
                                                    `}
                                                >
                                                    <div className={`mt-1 h-4 w-4 rounded border flex items-center justify-center transition-colors
                                                        ${selectedTreatments.includes(treatment.name) ? 'bg-gold border-gold' : 'border-white/30'}
                                                    `}>
                                                        {selectedTreatments.includes(treatment.name) && <Check className="h-3 w-3 text-black" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-baseline">
                                                            <span className={`text-sm font-medium ${selectedTreatments.includes(treatment.name) ? 'text-white' : 'text-white/70'}`}>
                                                                {treatment.name}
                                                            </span>
                                                            <span className="text-xs text-gold">{treatment.price}</span>
                                                        </div>
                                                        {treatment.description && (
                                                            <p className="text-[10px] text-white/30 mt-1 line-clamp-2">{treatment.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Price Display (Before Calendar) */}
                        <div className={`transition-all duration-500 overflow-hidden ${selectedTreatments.length > 0 ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-gradient-to-r from-gold/20 to-transparent border border-gold/30 rounded-2xl p-4 flex items-center justify-between mt-6 backdrop-blur-md">
                                <div className="flex flex-col">
                                    <span className="text-gold font-serif text-lg">Total Estimé</span>
                                    <span className="text-xs text-white/50">Payable sur place</span>
                                </div>
                                <span className="text-3xl font-serif text-white">{formattedPrice} <span className="text-sm font-sans text-white/50">DA</span></span>
                            </div>
                        </div>

                        {/* 2. CALENDAR (Only shows if service selected) */}
                        <div className={`transition-all duration-700 ${selectedTreatments.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 blur-sm pointer-events-none'}`}>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm mt-4">
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <span className="font-serif text-2xl text-gold">
                                        {monthNames[currentDate.getMonth()]} <span className="text-white/30">{currentDate.getFullYear()}</span>
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><ChevronRight className="h-5 w-5" /></button>
                                    </div>
                                </div>
                                {/* Time Slots (Shows only when date selected) */}
                                {/* Availability Text (Replaces Time Slots) */}
                                <div className={`transition-all duration-500 overflow-hidden ${selectedDate ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="flex flex-col items-center justify-center text-center p-6 border-t border-white/5 mt-4">
                                        <span className="font-serif text-lg text-white">
                                            Vous êtes disponible à partir de :
                                        </span>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">
                                            Nous confirmerons l'heure exacte par téléphone
                                        </p>
                                    </div>
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 mb-4 text-center">
                                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                                        <span key={day} className="text-xs font-bold text-white/20 py-2">{day}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2 text-center">
                                    {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                        const isPast = dateToCheck < today; // Check if past

                                        const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
                                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

                                        return (
                                            <button
                                                key={day}
                                                disabled={isPast}
                                                onClick={() => handleDateClick(day)}
                                                className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all duration-300 relative
                                                    ${isPast ? 'text-white/10 cursor-not-allowed' : 'hover:bg-white/10 text-white/80'}
                                                    ${isSelected ? 'bg-gold text-slate-900 font-bold scale-110 shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:bg-gold' : ''}
                                                    ${isToday && !isSelected ? 'border border-gold/30 text-gold' : ''}
                                                `}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>



                    </div>

                    {/* RIGHT COLUMN: Form */}
                    <div className="flex flex-col justify-center animate-in slide-in-from-right-8 duration-700 fade-in delay-200 sticky top-24">
                        <div className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

                            <h2 className="font-serif text-3xl text-white mb-8">Vos Coordonnées</h2>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Prénom</label>
                                            <input
                                                type="text"
                                                placeholder="Votre prénom"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all font-light"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nom</label>
                                            <input
                                                type="text"
                                                placeholder="Votre nom"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all font-light"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Téléphone</label>
                                        <PhoneInput
                                            value={formData.phone}
                                            onChange={(val, isValid) => {
                                                setFormData({ ...formData, phone: val });
                                                setIsPhoneValid(isValid);
                                            }}
                                        />
                                    </div>

                                    {/* Email (Optional) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1 flex justify-between">
                                            Email <span className="text-[10px] opacity-50">Optionnel</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="exemple@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all font-light"
                                        />
                                    </div>

                                    {/* Instagram (Mandatory + Validation) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gold/80 ml-1 flex justify-between">
                                            Instagram <span className="text-[10px] opacity-50">*Obligatoire</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="@votre_compte"
                                            value={formData.instagram}
                                            onChange={handleInstagramChange}
                                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all font-light
                                                ${instagramError ? 'border-red-500/50 focus:border-red-500' : 'border-gold/30 focus:border-gold focus:bg-white/10'}
                                            `}
                                        />
                                        {instagramError && (
                                            <div className="flex items-center gap-1 text-[10px] text-red-400 ml-1 animate-in fade-in slide-in-from-top-1">
                                                <AlertCircle className="h-3 w-3" /> {instagramError}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description (Optional) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1 flex justify-between">
                                            Demande Spéciale <span className="text-[10px] opacity-50">Optionnel</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Allergies, préférences, ou questions..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all font-light resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Summary of Selections */}
                                {(selectedTreatments.length > 0 || selectedDate) && (
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 space-y-2">
                                        <p className="uppercase tracking-widest text-gold pb-2 border-b border-white/10 mb-2">Résumé</p>

                                        {/* Date & Time */}
                                        {selectedDate && (
                                            <div className="flex justify-between items-center text-white/80">
                                                <span>📅 {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                                {selectedTime && <span className="font-bold text-gold">{selectedTime}</span>}
                                            </div>
                                        )}

                                        {/* Treatments */}
                                        {selectedTreatments.length > 0 && (
                                            <div className="space-y-1 pt-3 border-t border-white/5">
                                                {selectedTreatments.map(t => (
                                                    <div key={t} className="flex justify-between">
                                                        <span>• {t}</span>
                                                    </div>
                                                ))}

                                                {/* Summary Total */}
                                                <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/10 text-white font-medium">
                                                    <span className="text-gold uppercase text-[10px] tracking-widest">Total Estimé</span>
                                                    <span>{formattedPrice} DA</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={async () => {
                                        if (!isFormValid || isSubmitting) return;

                                        setIsSubmitting(true);
                                        setErrorMessage('');

                                        try {
                                            const serviceIds = selectedTreatments
                                                .map(name => services.find(s => s.name === name)?._id)
                                                .filter(Boolean) as string[];

                                            if (!selectedDate) {
                                                throw new Error("Veuillez sélectionner une date");
                                            }

                                            await createAppointment({
                                                firstName: formData.firstName,
                                                lastName: formData.lastName,
                                                phone: formData.phone,
                                                email: formData.email || undefined,
                                                instagram: formData.instagram,
                                                serviceIds: serviceIds,
                                                date: formatDateForConvex(selectedDate),
                                                time: "09:00",
                                                clientMessage: formData.description || undefined,
                                            });

                                            // Show success modal - DON'T navigate yet
                                            setShowSuccessModal(true);
                                        } catch (error: any) {
                                            console.error("Error:", error);
                                            setErrorMessage(error.message || "Une erreur s'est produite. Veuillez réessayer.");
                                            setShowErrorModal(true);
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }}
                                    className={`w-full relative group overflow-hidden rounded-xl py-4 transition-all duration-300
                                        ${isFormValid && !isSubmitting
                                            ? 'bg-gold text-slate-900 cursor-pointer hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'}
                                    `}
                                    disabled={!isFormValid || isSubmitting}
                                >
                                    <span className="relative z-10 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                        {isSubmitting ? 'Envoi en cours...' : 'Confirmer le Rendez-vous'}
                                    </span>
                                </button>

                                {!isFormValid && (
                                    <p className="text-center text-[10px] text-white/30 font-light mt-2">
                                        Veuillez remplir remplir les champs obligatoires (*) et sélectionner un soin.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                </div>
            </main>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative max-w-md w-full mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.3)] p-8 animate-in zoom-in-95 duration-300">
                        {/* Gold accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent rounded-t-3xl" />

                        <div className="text-center space-y-6">
                            {/* Success Icon */}
                            <div className="flex justify-center">
                                <div className="rounded-full bg-gold/10 p-4">
                                    <Check className="h-12 w-12 text-gold" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="font-serif text-3xl text-white">Rendez-vous Confirmé</h2>

                            {/* Message */}
                            <p className="text-white/60 leading-relaxed">
                                Merci pour votre réservation. Nous vous contacterons très bientôt pour confirmer l'heure exacte de votre rendez-vous.
                            </p>

                            {/* Button */}
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/');
                                }}
                                className="w-full bg-gold text-slate-900 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                            >
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative max-w-md w-full mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.3)] p-8 animate-in zoom-in-95 duration-300">
                        {/* Red accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-t-3xl" />

                        <div className="text-center space-y-6">
                            {/* Error Icon */}
                            <div className="flex justify-center">
                                <div className="rounded-full bg-red-500/10 p-4">
                                    <AlertCircle className="h-12 w-12 text-red-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="font-serif text-3xl text-white">Erreur</h2>

                            {/* Error Message */}
                            <p className="text-white/60 leading-relaxed">
                                {errorMessage || "Une erreur s'est produite lors de la réservation. Veuillez réessayer."}
                            </p>

                            {/* Button */}
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="w-full bg-red-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-all duration-300"
                            >
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;

