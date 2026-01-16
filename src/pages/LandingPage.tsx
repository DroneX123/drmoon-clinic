import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { smoothScrollTo } from '../utils/smoothScroll';
import langingPageBg from '../assets/langingPageBg.png';

import MoonMenuIcon from '../components/MoonMenuIcon';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showStickyBar, setShowStickyBar] = useState(true);
    const navigate = useNavigate();

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Hide sticky bar when near footer
    useEffect(() => {
        const handleScroll = () => {
            const footer = document.getElementById('footer');
            if (footer) {
                const footerTop = footer.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                // Hide bar when footer is 100px from bottom of screen
                setShowStickyBar(footerTop > windowHeight - 100);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="relative min-h-[100dvh] w-full font-sans text-white overflow-x-hidden">
            {/* Background Image - Fixed position to stay while scrolling */}
            <div className="fixed inset-0 z-0">
                <img
                    src={langingPageBg}
                    alt="Background"
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover object-[75%] md:object-center"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
            </div>

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
                        className="group flex flex-col cursor-pointer transition-transform hover:scale-105"
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
                    onClick={() => smoothScrollTo('footer', 1200)}
                    className="group relative overflow-hidden rounded-full bg-white/10 px-6 py-2 backdrop-blur-md transition-all hover:bg-gold/20"
                >
                    <span className="relative z-10 text-xs font-bold uppercase tracking-widest text-white group-hover:text-gold transition-colors">
                        Contactez-nous
                    </span>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </button>
            </nav>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col w-full">

                {/* Hero Section */}
                <section className="flex min-h-[100dvh] flex-col justify-center px-6 md:justify-end md:px-12 md:pb-20 relative">
                    <div className="flex w-full flex-col md:flex-row md:items-end md:justify-between">

                        {/* Text Content */}
                        <div className="flex max-w-2xl flex-col items-start gap-6 text-left transform transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
                            <div className="space-y-4">
                                <p className="text-gold text-xs font-bold uppercase tracking-[0.2em] md:text-sm">
                                    Médecine Esthétique • Botox • Fillers
                                </p>
                                <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight text-white md:text-7xl lg:text-8xl">
                                    Révélez Votre <br />
                                    <span className="italic text-white">Éclat Naturel</span>
                                </h1>
                            </div>

                            <p className="max-w-xs text-sm font-light leading-relaxed text-gray-300 md:max-w-md md:text-lg">
                                Une approche subtile et raffinée pour sublimer votre beauté. Expertise médicale au cœur de Hydra, Alger.
                            </p>
                        </div>

                        {/* Desktop CTA */}
                        <div className="flex max-md:hidden items-center flex-shrink-0 min-w-fit ml-8">
                            <button
                                onClick={() => navigate('/offers')}
                                className="group flex items-center gap-4 rounded-full bg-[#A5F3FC] pl-8 pr-2 py-2 text-[#0F172A] transition-all hover:bg-white hover:scale-105 shadow-[0_0_30px_rgba(165,243,252,0.3)]"
                            >
                                <span className="text-xs font-bold tracking-widest uppercase whitespace-nowrap">Prendre Rendez-vous</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-all group-hover:rotate-[-45deg] group-hover:scale-110">
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </button>
                        </div>

                    </div>

                    {/* Scroll Indicator (Optional, but helps since we now have scroll) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce md:hidden">
                        <span className="text-white/50 text-xs tracking-widest uppercase">Découvrir</span>
                    </div>
                </section>

                {/* Services Section */}
                {/* <section id="services" className="w-full pb-32 pt-12 md:pb-24">
                    <div className="px-6 md:px-12 mb-8">
                        <h2 className="font-serif text-3xl font-light text-white opacity-90 md:text-4xl">Nos Soins & Tarifs</h2>
                        <div className="h-px w-24 bg-gold mt-4"></div>
                    </div>
                    <ServiceAccordion />
                </section> */}

                <div id="footer">
                    <Footer />
                </div>
            </div>

            {/* Sticky Booking Bar - Mobile Only */}
            {showStickyBar && (
                <div className="fixed bottom-0 left-0 z-50 w-full bg-gradient-to-t from-black via-black/95 to-transparent pb-6 pt-8 px-6 md:hidden pointer-events-none transition-opacity duration-300">
                    <button
                        onClick={() => navigate('/offers')}
                        className="pointer-events-auto group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#A5F3FC] py-4 text-[#0F172A] transition-transform active:scale-95 shadow-[0_0_20px_rgba(165,243,252,0.3)]"
                    >
                        <span className="font-bold tracking-widest uppercase text-sm">Prendre Rendez-vous</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            )}
        </div >
    );
};

export default LandingPage;
