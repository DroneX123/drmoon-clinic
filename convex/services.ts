import { query } from "./_generated/server";
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
