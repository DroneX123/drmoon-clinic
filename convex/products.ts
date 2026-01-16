import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all products for the dropdown
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

// Seed some dummy products for testing
export const seedProducts = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("products").first();
        if (existing) return "Products already seeded";

        // Create a dummy supplier
        const supplierId = await ctx.db.insert("suppliers", {
            name: "Esthetique Pro DZ",
            phone: "+213550000000",
            email: "contact@supplier.dz",
        });

        // Seed products
        await ctx.db.insert("products", {
            name: "Toxine Botulique (Vial)",
            stock_quantity: 50,
            buy_price: 12000,
            supplier_id: supplierId,
        });

        await ctx.db.insert("products", {
            name: "Acide Hyaluronique (1ml)",
            stock_quantity: 100,
            buy_price: 8000,
            supplier_id: supplierId,
        });

        await ctx.db.insert("products", {
            name: "Kit Peeling",
            stock_quantity: 20,
            buy_price: 15000,
            supplier_id: supplierId,
        });

        await ctx.db.insert("products", {
            name: "Fils Tenseurs (Pack)",
            stock_quantity: 30,
            buy_price: 25000,
            supplier_id: supplierId,
        });

        return "Products seeded successfully";
    },
});
