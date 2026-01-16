import { mutation } from "./_generated/server";


/**
 * SEED SERVICES
 * Populate the database with your services
 * Run this once to initialize your services
 */
export const seedServices = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if services already exist
        const existing = await ctx.db.query("services").first();
        if (existing) {
            return { message: "Services already seeded" };
        }

        // Visage (Face) Services
        await ctx.db.insert("services", {
            name: "Botox",
            category: "Visage",
            price: 15000,
            description: "Traitement anti-rides ciblé pour un visage lisse et rajeuni",
            duration_minutes: 30,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Fillers",
            category: "Visage",
            price: 20000,
            description: "Comblement des rides et volumes du visage",
            duration_minutes: 45,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Peeling Chimique",
            category: "Visage",
            price: 8000,
            description: "Exfoliation profonde pour une peau éclatante",
            duration_minutes: 60,
            is_active: true,
        });

        // Corps (Body) Services
        await ctx.db.insert("services", {
            name: "Mésothérapie Corps",
            category: "Corps",
            price: 12000,
            description: "Traitement ciblé pour la cellulite et raffermissement",
            duration_minutes: 45,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Cryolipolyse",
            category: "Corps",
            price: 25000,
            description: "Réduction des amas graisseux par le froid",
            duration_minutes: 90,
            is_active: true,
        });

        // Peau (Skin) Services
        await ctx.db.insert("services", {
            name: "Laser CO2",
            category: "Peau",
            price: 18000,
            description: "Resurfaçage cutané pour cicatrices et texture",
            duration_minutes: 60,
            is_active: true,
        });

        await ctx.db.insert("services", {
            name: "Hydrafacial",
            category: "Peau",
            price: 10000,
            description: "Nettoyage en profondeur et hydratation intense",
            duration_minutes: 45,
            is_active: true,
        });

        return { message: "Services seeded successfully", count: 7 };
    },
});

export const seedAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("admins").first();
        if (!existing) {
            await ctx.db.insert("admins", {
                username: "admin",
                password: "drmoon2024",
            });
            return "Admin seeded";
        }
        return "Admin already exists";
    },
});
