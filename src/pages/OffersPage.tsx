import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { smoothScrollTo } from '../utils/smoothScroll';
import MoonMenuIcon from '../components/MoonMenuIcon';
import Footer from '../components/Footer';
import visageBg from '../assets/visage_blonde.png';
import corpsBg from '../assets/body_fit.png';
import peauBg from '../assets/skin_glow.png';

import { RITUALS, Ritual } from '../utils/constants';

const OffersPage: React.FC = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);

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
                        className="flex flex-col text-left group"
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
                    onClick={() => smoothScrollTo('footer', 2000)}
                    className="group relative overflow-hidden rounded-full bg-white/10 px-6 py-2 backdrop-blur-md transition-all hover:bg-gold/20"
                >
                    <span className="relative z-10 text-xs font-bold uppercase tracking-widest text-white group-hover:text-gold transition-colors">
                        Contactez-nous
                    </span>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </button>
            </nav>

            {/* Main Content - Full Screen Stack */}
            <div className="flex flex-col w-full">

                {/* Main Title - Floating/Fixed logic or just top section */}
                <div className="pt-24 pb-8 text-center bg-slate-950">
                    <h1 className="font-serif text-4xl text-white tracking-tight">NOS RITUELS</h1>
                    <div className="mx-auto mt-4 h-px w-12 bg-gold/50"></div>
                </div>

                {/* Sections Stack */}
                {RITUALS.map((ritual) => (
                    <div
                        key={ritual.id}
                        onClick={() => setSelectedRitual(ritual)}
                        className="group relative h-[40vh] md:h-[50vh] w-full cursor-pointer overflow-hidden border-b border-white/5 last:border-none"
                    >
                        {/* Background Image with Zoom Effect - Hover (Desktop) & Active (Mobile Press) */}
                        <div className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform md:group-hover:scale-105 group-active:scale-110">
                            <img
                                src={ritual.image}
                                alt={ritual.title}
                                className="h-full w-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 md:group-hover:bg-black/30 group-active:bg-black/30" />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            {/* Title: Always Gold on Mobile (default) -> White on Tablet (default) -> Gold on Hover/Active */}
                            <h2 className="font-serif text-3xl md:text-5xl tracking-widest mb-2 drop-shadow-md transition-colors duration-300 text-gold md:text-white md:group-hover:text-gold group-active:text-gold">
                                {ritual.title}
                            </h2>

                            {/* Subtitle: Always visible */}
                            <p className="font-light text-xs md:text-sm tracking-[0.2em] text-gray-200 uppercase opacity-90 md:opacity-80 md:group-hover:opacity-100 group-active:opacity-100">
                                {ritual.subtitle}
                            </p>

                            {/* Button: Visible on Mobile, Slide-up on Desktop Hover & Mobile Press */}
                            <span className="mt-6 text-[10px] uppercase font-bold tracking-widest text-white/90 border border-white/30 px-4 py-2 rounded-full transition-all duration-300 
                                             opacity-100 translate-y-0
                                             md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0
                                             group-active:scale-95">
                                Découvrir
                            </span>
                        </div>
                    </div>
                ))}

            </div>

            {/* MODAL OVERLAY (Standard) */}
            {selectedRitual && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 backdrop-blur-sm animate-in fade-in duration-300">

                    <div className="relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-white/10 shadow-2xl md:flex animate-in zoom-in-95 duration-300">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedRitual(null)}
                            className="absolute right-4 top-4 z-20 rounded-full bg-black/20 p-2 text-white/60 hover:bg-black/40 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Image - Reduced width to 1/3 for more text space */}
                        <div className="h-40 w-full md:h-auto md:w-1/3 relative shrink-0">
                            <div className="absolute inset-0 bg-gold/10 mix-blend-overlay z-10" />
                            <img
                                src={selectedRitual.image}
                                alt={selectedRitual.title}
                                className="h-full w-full object-cover grayscale opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent md:bg-gradient-to-r" />
                        </div>

                        {/* Modal Content - Expanded width */}
                        <div className="flex flex-col p-6 md:p-8 md:w-2/3 overflow-y-auto no-scrollbar md:custom-scrollbar max-h-[60vh] md:max-h-none">
                            <h2 className="mb-1 font-serif text-3xl text-gold">{selectedRitual.title}</h2>
                            <p className="mb-8 text-xs font-bold uppercase tracking-widest text-white/50">{selectedRitual.subtitle}</p>

                            <p className="mb-8 text-sm text-slate-400 font-light leading-relaxed border-l-2 border-gold/30 pl-4">
                                {selectedRitual.description}
                            </p>

                            {/* Pricing List */}
                            <div className="flex-1 space-y-6">
                                {selectedRitual.treatments.map((item, index) => (
                                    <div key={index} className="flex flex-col w-full group/item">
                                        <div className="flex items-baseline justify-between w-full">
                                            <span className="text-base font-medium text-white shrink-0 group-hover/item:text-gold transition-colors font-serif tracking-wide">
                                                {item.name}
                                            </span>
                                            {/* Solid Line connecting Name and Price */}
                                            <span className="flex-1 border-b border-white/20 mx-4 mb-1 opacity-50"></span>
                                            <span className="text-base font-bold text-gold shrink-0">{item.price}</span>
                                        </div>
                                        {/* Description Line - Dynamic Height */}
                                        {item.description && (
                                            <p className="text-xs text-slate-500 mt-1 font-light italic leading-relaxed w-[95%]">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Modal Action */}
                            <button
                                onClick={() => navigate('/booking')}
                                className="mt-8 w-full bg-white/5 hover:bg-gold hover:text-black text-gold border border-gold/20 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300"
                            >
                                Réserver ce Rituel
                            </button>
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

export default OffersPage;
