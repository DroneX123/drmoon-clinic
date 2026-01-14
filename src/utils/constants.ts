import visageBg from '../assets/visage_blonde.png';
import corpsBg from '../assets/body_fit.png';
import peauBg from '../assets/skin_glow.png';

export interface SubService {
    name: string;
    price: string;
    description?: string;
}

export interface Ritual {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    description: string;
    treatments: SubService[];
    totalPrice?: string;
}

export const RITUALS: Ritual[] = [
    {
        id: 'visage',
        title: 'VISAGE',
        subtitle: 'Harmonie & Rajeunissement Subtil',
        image: visageBg,
        description: 'Nos protocoles experts pour sublimer vos traits et restaurer l’éclat de votre jeunesse.',
        treatments: [
            { name: "Consultation Morphologique", price: "Offert", description: "Analyse détaillée et personnalisée de votre structure faciale." },
            { name: "Full Face Harmony (Botox & Fillers)", price: "55 000 DA", description: "Correction globale pour restaurer les volumes et l'équilibre." },
            { name: "Glamour Lips (Contour & Volume)", price: "22 000 DA", description: "Redéfinition subtile du contour et apport de volume naturel." },
            { name: "Fox Eyes (Fils Tenseurs)", price: "45 000 DA", description: "Technique de fils tenseurs pour un regard étiré et rajeuni." },
        ]
    },
    {
        id: 'corps',
        title: 'CORPS',
        subtitle: 'Sculpture & Fermeté',
        image: corpsBg,
        description: 'Redessinez votre silhouette avec nos technologies de pointe pour le corps.',
        treatments: [
            { name: "Bilan Corporel", price: "Offert", description: "Diagnostic complet de votre silhouette et de vos besoins." },
            { name: "Cryolipolyse (Amincissement)", price: "15 000 DA / Zone", description: "Destruction définitive des amas graisseux par le froid." },
            { name: "Mésothérapie (Cellulite)", price: "10 000 DA", description: "Traitement ciblé pour lisser la peau et réduire l'aspect peau d'orange." },
            { name: "Radiofréquence (Relâchement)", price: "8 000 DA", description: "Technologie par ondes pour raffermir et tonifier la peau." },
        ]
    },
    {
        id: 'peau',
        title: 'PEAU',
        subtitle: 'Éclat & Vitalité',
        image: peauBg,
        description: 'Des soins profonds pour une qualité de peau irréprochable et un teint lumineux.',
        treatments: [
            { name: "Hydrafacial Élite", price: "15 000 DA", description: "Nettoyage profond, extraction et hydratation intense en un soin." },
            { name: "Skinbooster (Hydratation Profonde)", price: "20 000 DA", description: "Micro-injections d'acide hyaluronique pour repulper le derme." },
            { name: "Mesolift (Vitamine)", price: "12 000 DA", description: "Cocktail poly-revitalisant de vitamines pour un coup d'éclat immédiat." },
            { name: "Peeling Éclat", price: "18 000 DA", description: "Exfoliation contrôlée pour unifier le teint et lisser le grain de peau." },
        ]
    }
];
