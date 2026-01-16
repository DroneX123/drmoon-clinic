import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * GET ALL SERVICES
 * Returns all active services for the booking page
 */
export const getAllServices = query({
    args: {},
    handler: async (ctx) => {
        const services = await ctx.db
            .query("services")
            .filter((q) => q.eq(q.field("is_active"), true))
            .collect();

        return services;
    },
});

/**
 * GET SERVICES BY CATEGORY
 * Returns services filtered by category (Visage, Corps, Peau)
 */
export const getServicesByCategory = query({
    args: {
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const services = await ctx.db
            .query("services")
            .filter((q) =>
                q.and(
                    q.eq(q.field("category"), args.category),
                    q.eq(q.field("is_active"), true)
                )
            )
            .collect();

        return services;
    },
});

/**
 * GET SERVICE BY ID
 * Returns full details of a specific service
 */
export const getServiceById = query({
    args: {
        serviceId: v.id("services"),
    },
    handler: async (ctx, args) => {
        const service = await ctx.db.get(args.serviceId);
        return service;
    },
});

/**
 * CREATE SERVICE
 */
export const createService = mutation({
    args: {
        name: v.string(),
        category: v.string(), // "Visage", "Corps", "Peau"
        price: v.number(),
        description: v.optional(v.string()),
        duration_minutes: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("services", {
            ...args,
            is_active: true,
        });
    },
});

/**
 * UPDATE SERVICE
 */
export const updateService = mutation({
    args: {
        id: v.id("services"),
        name: v.optional(v.string()),
        category: v.optional(v.string()),
        price: v.optional(v.number()),
        description: v.optional(v.string()),
        duration_minutes: v.optional(v.number()),
        is_active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

/**
 * DELETE SERVICE
 */
export const deleteService = mutation({
    args: { id: v.id("services") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
