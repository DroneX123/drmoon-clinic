import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { smoothScrollTo } from '../utils/smoothScroll';
import MoonMenuIcon from '../components/MoonMenuIcon';
import Footer from '../components/Footer';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RITUALS, Ritual } from '../utils/constants';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);

    // Fetch Dynamic Services from Convex
    const services = useQuery(api.services.getAllServices) || [];

    // Merge DB services with Static Metadata (Images, Titles)
    const dynamicRituals = React.useMemo(() => {
        return RITUALS.map(ritual => {
            const dbTreatments = services
                .filter(s => s.category.toLowerCase() === ritual.id.toLowerCase())
                .map(s => ({
                    name: s.name,
                    price: s.price === 0 ? "Offert" : `${s.price.toLocaleString('fr-FR').replace(/\s/g, ' ')} DA`,
                    description: s.description
                }));

            return {
                ...ritual,
                treatments: dbTreatments.length > 0 ? dbTreatments : ritual.treatments
            };
        });
    }, [services]);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="relative min-h-[100dvh] w-full bg-slate-950 font-sans text-white">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between px-6 py-6 md:px-12 md:py-8 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-[2px]">
                {/* Left: Menu & Brand */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="group flex items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur-sm transition-all hover:bg-gold/20 hover:text-gold"
                        aria-label="Menu"
                    >
                        <MoonMenuIcon className="h-5 w-5 text-white" />
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex flex-col text-left group transition-transform hover:scale-105"
                    >
                        <span className="font-serif text-lg font-medium leading-none tracking-wide text-white group-hover:text-gold transition-colors">
                            Dr. Moon
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">
                            Cabinet Esthétique
                        </span>
                    </button>
                </div>

                {/* Right: Contact 'Stylish' Button */}
                <button
                    onClick={() => smoothScrollTo('footer')}
                    className="group relative overflow-hidden rounded-full border border-white/30 px-6 py-2 
                               backdrop-blur-sm transition-all duration-500
                               hover:bg-white/5 hover:backdrop-blur-md hover:border-gold/50"
                >
                    <span className="relative z-10 text-xs font-bold uppercase tracking-widest text-white group-hover:text-gold transition-colors">
                        Contactez-nous
                    </span>
                </button>
            </nav>

            {/* Main Content - Full Screen Stack */}
            <div className="flex flex-col w-full">

                {/* Minimalist Header for Home Page */}
                <div className="pt-32 pb-12 text-center bg-slate-950 px-4">
                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4 opacity-80 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Médecine Esthétique & Anti-Âge
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                        L'ART DU SOIN
                    </h1>
                    <p className="max-w-md mx-auto text-sm font-light text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Une approche sur-mesure pour sublimer votre beauté naturelle, au cœur de Hydra.
                    </p>
                    <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent animate-in zoom-in duration-1000 delay-300"></div>
                </div>

                {/* Sections Stack */}
                {dynamicRituals.map((ritual) => (
                    <div
                        key={ritual.id}
                        onClick={() => setSelectedRitual(ritual)}
                        className="group relative h-[45vh] md:h-[60vh] w-full cursor-pointer overflow-hidden border-b border-white/5 last:border-none"
                    >
                        {/* Background Image with Zoom Effect - Hover (Desktop) & Active (Mobile Press) */}
                        <div className="absolute inset-0 transition-transform duration-1000 ease-out will-change-transform md:group-hover:scale-105 group-active:scale-110">
                            <img
                                src={ritual.image}
                                alt={ritual.title}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 md:group-hover:bg-black/20 group-active:bg-black/20" />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            {/* Title: Always Gold on Mobile (default) -> White on Tablet (default) -> Gold on Hover/Active */}
                            <h2 className="font-serif text-4xl md:text-6xl tracking-widest mb-3 drop-shadow-lg transition-colors duration-500 text-gold md:text-white md:group-hover:text-gold group-active:text-gold transform translate-y-0 group-hover:-translate-y-2">
                                {ritual.title}
                            </h2>

                            {/* Subtitle: Always visible */}
                            <p className="font-light text-xs md:text-sm tracking-[0.2em] text-gray-200 uppercase opacity-90 md:opacity-80 md:group-hover:opacity-100 group-active:opacity-100">
                                {ritual.subtitle}
                            </p>

                            {/* Button: Visible on Mobile, Slide-up on Desktop Hover & Mobile Press */}
                            <span className="mt-8 text-[10px] uppercase font-bold tracking-widest text-white border border-white/30 px-6 py-2 rounded-full transition-all duration-500
                                             opacity-100 translate-y-0 backdrop-blur-sm
                                             md:opacity-0 md:translate-y-8 md:group-hover:opacity-100 md:group-hover:translate-y-0
                                             md:group-hover:bg-white/10 md:group-hover:backdrop-blur-md md:group-hover:border-white/50
                                             group-active:scale-95 group-active:bg-white/10">
                                Découvrir
                            </span>
                        </div>
                    </div>
                ))}

            </div>

            {/* MODAL OVERLAY (Standard) */}
            {selectedRitual && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 px-4 backdrop-blur-md animate-in fade-in duration-300">

                    <div className="relative w-full max-w-4xl max-h-[90dvh] overflow-hidden rounded-3xl bg-[#0F172A] border border-white/10 shadow-2xl md:flex animate-in zoom-in-95 duration-300">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedRitual(null)}
                            className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2 text-white/60 hover:bg-gold hover:text-black transition-all border border-white/5 hover:border-gold/50"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Image - Reduced width to 1/3 for more text space */}
                        <div className="h-48 w-full md:h-auto md:w-5/12 relative shrink-0">
                            <div className="absolute inset-0 bg-gold/10 mix-blend-overlay z-10" />
                            <img
                                src={selectedRitual.image}
                                alt={selectedRitual.title}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover grayscale opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent md:bg-gradient-to-r" />

                            {/* Decorative Badge */}
                            <div className="absolute bottom-6 left-6 z-20">
                                <span className="font-serif text-3xl text-gold">{selectedRitual.title}</span>
                            </div>
                        </div>

                        {/* Modal Content - Expanded width */}
                        <div className="flex flex-col p-6 md:p-10 md:w-7/12 overflow-y-auto custom-scrollbar bg-[#0F172A]">
                            <div className="mb-8">
                                <h2 className="mb-2 font-serif text-4xl text-white hidden md:block">{selectedRitual.title}</h2>
                                <p className="mb-6 text-xs font-bold uppercase tracking-widest text-gold opacity-80">{selectedRitual.subtitle}</p>

                                <p className="text-sm text-slate-300 font-light leading-relaxed border-l-2 border-gold/30 pl-4 italic">
                                    "{selectedRitual.description}"
                                </p>
                            </div>

                            {/* Pricing List */}
                            <div className="flex-1 space-y-5 mb-8">
                                {selectedRitual.treatments.map((item, index) => (
                                    <div key={index} className="flex flex-col w-full group/item cursor-default">
                                        <div className="flex items-baseline justify-between w-full">
                                            <span className="text-sm md:text-base font-medium text-white shrink-0 group-hover/item:text-gold transition-colors font-serif tracking-wide">
                                                {item.name}
                                            </span>
                                            {/* Solid Line connecting Name and Price */}
                                            <span className="flex-1 border-b border-white/10 mx-4 mb-1 opacity-30"></span>
                                            <span className="text-sm md:text-base font-bold text-gold shrink-0">{item.price}</span>
                                        </div>
                                        {/* Description Line - Dynamic Height */}
                                        {item.description && (
                                            <p className="text-[10px] md:text-xs text-slate-500 mt-1 font-light leading-relaxed w-[95%]">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Modal Action - Sticky Bottom on Mobile if content is long, but here it's static */}
                            <div className="mt-auto pt-6 border-t border-white/5">
                                <button
                                    onClick={() => navigate(`/booking?category=${selectedRitual.id}`)}
                                    className="w-full bg-gold hover:bg-white hover:text-slate-900 text-slate-900 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                >
                                    Réserver ce Rituel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Backdrop Click */}
                    <div className="absolute inset-0 -z-10" onClick={() => setSelectedRitual(null)} />
                </div>
            )}

            <div id="footer">
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
