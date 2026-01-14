import React from 'react';
import { Instagram } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer id="footer" className="w-full bg-[#050505] py-20 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-center md:text-left relative z-10">
                {/* 1. Brand & Philosophy */}
                <div className="space-y-6 flex flex-col items-center md:items-start">
                    <div>
                        <h3 className="font-serif text-3xl text-white tracking-wide">Dr. Moon</h3>
                        <p className="text-[10px] text-gold uppercase tracking-[0.3em] mt-1">Cabinet Esthétique</p>
                    </div>
                    <p className="text-sm text-slate-400 font-light leading-relaxed max-w-xs mx-auto md:mx-0">
                        L'excellence médicale au service de votre beauté naturelle. Une approche holistique et raffinée.
                    </p>
                </div>

                {/* 2. Contact & Socials */}
                <div className="space-y-6 flex flex-col items-center md:items-start">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-2 mb-2">Contact</h4>

                    <div className="space-y-4">
                        <a href="tel:+213541307735" className="group flex flex-col items-center md:items-start overflow-hidden">
                            <span className="text-2xl font-light text-white group-hover:text-gold transition-colors duration-300">0541 30 77 35</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-gold/60 transition-colors">Appeler le cabinet</span>
                        </a>

                        <a
                            href="https://instagram.com/dr_moon_cabinet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 group"
                        >
                            <div className="p-2 rounded-full border border-white/10 group-hover:border-gold/50 group-hover:text-gold bg-white/5 transition-colors">
                                <Instagram className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium tracking-wide">@dr_moon_cabinet</span>
                        </a>
                    </div>
                </div>

                {/* 3. Location (Smart Link) */}
                <div className="space-y-6 flex flex-col items-center md:items-start">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-2 mb-2">Localisation</h4>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            const address = "Cabinet Dr Moon, Hydra, Alger";
                            const encoded = encodeURIComponent(address);
                            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                            if (isIOS) {
                                window.location.href = `http://maps.apple.com/?q=${encoded}`;
                            } else {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
                            }
                        }}
                        className="group block text-center md:text-left cursor-pointer"
                    >
                        <p className="text-xl text-white font-serif group-hover:text-gold transition-colors duration-300">Hydra, Alger</p>
                        <p className="text-sm text-slate-500 mt-2 flex items-center justify-center md:justify-start gap-2 group-hover:text-slate-300 transition-colors">
                            <span>📍</span> Itinéraire
                        </p>
                    </a>
                </div>
            </div>

            <div className="mt-20 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors cursor-default">
                    &copy; 2026 Cabinet Dr. Moon. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
