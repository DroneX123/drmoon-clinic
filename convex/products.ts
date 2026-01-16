import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all products for the dropdown
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

/**
 * GET ALL SUPPLIERS
 */
export const getAllSuppliers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("suppliers").collect();
    },
});
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
/**
 * CREATE PRODUCT
 */
export const createProduct = mutation({
    args: {
        name: v.string(),
        stock_quantity: v.number(),
        buy_price: v.number(),
        selling_price: v.optional(v.number()),
        supplier_id: v.id("suppliers"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("products", args);
    },
});

/**
 * UPDATE PRODUCT
 */
export const updateProduct = mutation({
    args: {
        id: v.id("products"),
        name: v.optional(v.string()),
        stock_quantity: v.optional(v.number()),
        buy_price: v.optional(v.number()),
        selling_price: v.optional(v.number()),
        supplier_id: v.optional(v.id("suppliers")),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

/**
 * DELETE PRODUCT
 */
export const deleteProduct = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
