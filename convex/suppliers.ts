import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * GET ALL SUPPLIERS
 */
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("suppliers").collect();
    },
});

/**
 * CREATE SUPPLIER
 */
export const createSupplier = mutation({
    args: {
        name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        instagram: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("suppliers", args);
    },
});

/**
 * UPDATE SUPPLIER
 */
export const updateSupplier = mutation({
    args: {
        id: v.id("suppliers"),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        instagram: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

/**
 * DELETE SUPPLIER
 */
export const deleteSupplier = mutation({
    args: { id: v.id("suppliers") },
    handler: async (ctx, args) => {
        // Optional: Check if used in products before delete? 
        // For now, strict delete.
        await ctx.db.delete(args.id);
    },
});
