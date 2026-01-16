import React from 'react';
import { Phone, Instagram } from 'lucide-react';

interface ClientContactDisplayProps {
    phone: string;
    instagram?: string;
    className?: string; // Allow custom styling wrapper
}

const ClientContactDisplay: React.FC<ClientContactDisplayProps> = ({ phone, instagram, className }) => {
    // Helper to format phone for href
    const telHref = `tel:${phone}`;

    // Helper to format/validate instagram URL
    // Supports: "@username", "username", "https://instagram.com/username"
    const getInstaHref = (input: string) => {
        if (input.startsWith('http')) return input;
        const clean = input.replace('@', '').trim();
        return `https://instagram.com/${clean}`;
    };

    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            {/* Phone Button */}
            <a
                href={telHref}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg transition-all text-xs font-bold group"
                title="Appeler le client"
            >
                <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                <span>{phone}</span>
            </a>

            {/* Instagram Button */}
            {instagram && (
                <a
                    href={getInstaHref(instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-pink-50 border border-pink-100 hover:bg-pink-100 hover:border-pink-200 text-pink-600 w-8 h-8 rounded-lg transition-all"
                    title="Voir le profil Instagram"
                >
                    <Instagram className="w-4 h-4" />
                </a>
            )}
        </div>
    );
};

export default ClientContactDisplay;
