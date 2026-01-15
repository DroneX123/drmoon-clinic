import { mutation } from "./_generated/server";

/**
 * UPDATE SERVICES WITH CORRECT DATA
 * Services matching the reference image
 */
export const updateServicesWithCorrectData = mutation({
    args: {},
    handler: async (ctx) => {
        // Delete all existing services
        const allServices = await ctx.db.query("services").collect();
        for (const service of allServices) {
            await ctx.db.delete(service._id);
        }

        // Visage (Face) Services - Based on reference image
        await ctx.db.insert("services", {
            name: "Consultation Morphologique",
            category: "Visage",
            price: 0, // Offert
            description: "Analyse détaillée et personnalisée de votre structure faciale.",
            duration_minutes: 30,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Full Face Harmony (Botox & Fillers)",
            category: "Visage",
            price: 55000,
            description: "Correction globale pour restaurer les volumes et l'équilibre.",
            duration_minutes: 90,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Glamour Lips (Contour & Volume)",
            category: "Visage",
            price: 22000,
            description: "Redéfinition subtile du contour et apport de volume naturel.",
            duration_minutes: 45,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Fox Eyes (Fils Tenseurs)",
            category: "Visage",
            price: 45000,
            description: "Technique de fils tenseurs pour un regard étiré et rajeuni.",
            duration_minutes: 60,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Botox",
            category: "Visage",
            price: 15000,
            description: "Traitement anti-rides ciblé pour un visage lisse et rajeuni.",
            duration_minutes: 30,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Fillers",
            category: "Visage",
            price: 20000,
            description: "Comblement des rides et restauration des volumes du visage.",
            duration_minutes: 45,
            is_active: true,
        });

        // Corps (Body) Services
        await ctx.db.insert("services", {
            name: "Mésothérapie Corps",
            category: "Corps",
            price: 12000,
            description: "Traitement ciblé pour réduire la cellulite et raffermir la peau.",
            duration_minutes: 45,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Cryolipolyse",
            category: "Corps",
            price: 25000,
            description: "Réduction des amas graisseux par le froid, technique non invasive.",
            duration_minutes: 90,
            is_active: true,
        });

        // Peau (Skin) Services
        await ctx.db.insert("services", {
            name: "Laser CO2",
            category: "Peau",
            price: 18000,
            description: "Resurfaçage cutané pour atténuer cicatrices et améliorer la texture.",
            duration_minutes: 60,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Hydrafacial",
            category: "Peau",
            price: 10000,
            description: "Nettoyage en profondeur et hydratation intense pour une peau éclatante.",
            duration_minutes: 45,
            is_active: true,
        });

        return { message: "Services updated with correct data from reference image!", count: 10 };
    },
});
