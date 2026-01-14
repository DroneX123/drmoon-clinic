import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface ServiceItem {
    id: string;
    name: string;
    price: string;
}

interface Category {
    id: string;
    title: string;
    description?: string;
    items: ServiceItem[];
}

const MENU_DATA: Category[] = [
    {
        id: 'injectables',
        title: 'INJECTABLES',
        description: 'Visage',
        items: [
            { id: 'botox1', name: 'Botox (1 Zone)', price: '15 000 DA' },
            { id: 'botox3', name: 'Botox (3 Zones)', price: '35 000 DA' },
            { id: 'lips', name: 'Comblement Lèvres (1ml)', price: '25 000 DA' },
            { id: 'jawline', name: 'Jawline Contouring', price: 'Sur Devis' },
        ],
    },
    {
        id: 'soins',
        title: 'SOINS DE PEAU',
        description: 'Skin Quality',
        items: [
            { id: 'skinbooster', name: 'Skinbooster (Hydratation)', price: '20 000 DA' },
            { id: 'profhilo', name: 'Profhilo (Bio-Remodelage)', price: '35 000 DA' },
            { id: 'meso', name: 'Mesotherapy (Vitamine)', price: '12 000 DA' },
        ],
    },
    {
        id: 'corps',
        title: 'SILHOUETTE & CORPS',
        items: [
            { id: 'foxeyes', name: 'Fox Eyes (Fils Tenseurs)', price: '45 000 DA' },
            { id: 'cellulite', name: 'Traitement Cellulite', price: 'Sur Consultation' },
            { id: 'amincissement', name: 'Amincissement (Cryo)', price: '10 000 DA / Séance' },
        ],
    },
];

const ServiceAccordion: React.FC = () => {
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    const toggleCategory = (id: string) => {
        setOpenCategory(openCategory === id ? null : id);
    };

    return (
        <section className="relative z-20 w-full px-6 py-12 md:px-12">
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/5">

                {MENU_DATA.map((category) => {
                    const isOpen = openCategory === category.id;

                    return (
                        <div key={category.id} className="border-b border-white/10 last:border-none">
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="group flex w-full items-center justify-between p-6 text-left transition-colors"
                            >
                                <div>
                                    <h3 className={`font-serif text-xl tracking-wider transition-colors duration-300 ${isOpen ? 'text-yellow-500' : 'text-white'}`}>
                                        {category.title}
                                    </h3>
                                    {category.description && (
                                        <p className="mt-1 text-xs font-light uppercase tracking-widest text-slate-400">
                                            {category.description}
                                        </p>
                                    )}
                                </div>

                                {/* Icon Wrapper */}
                                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45 text-yellow-500' : 'text-slate-400 group-hover:text-white'}`}>
                                    <Plus className="h-6 w-6 font-thin" strokeWidth={1} />
                                </div>
                            </button>

                            {/* Accordion Content */}
                            <div
                                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}
                            >
                                <div className="overflow-hidden px-6">
                                    <ul className="space-y-4 pt-2">
                                        {category.items.map((item) => (
                                            <li key={item.id} className="flex items-center justify-between text-sm md:text-base border-b border-white/5 pb-2 last:border-none">
                                                <span className="font-lato text-slate-300 font-light">{item.name}</span>
                                                <span className="font-lato text-slate-400 font-medium tracking-wide">{item.price}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>
        </section>
    );
};

export default ServiceAccordion;
