import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ADMIN QUERIES
 * For your future admin dashboard
 */

// Get all appointments (with filters)
export const getAllAppointments = query({
    args: {
        status: v.optional(v.string()), // Filter by status
    },
    handler: async (ctx, args) => {
        let appointmentsQuery = ctx.db.query("appointments");

        if (args.status) {
            appointmentsQuery = appointmentsQuery.filter((q) =>
                q.eq(q.field("status"), args.status)
            );
        }

        const appointments = await appointmentsQuery.collect();

        // Enrich with client and service details
        const enriched = await Promise.all(
            appointments.map(async (apt) => {
                const client = await ctx.db.get(apt.client_id);
                const services = await Promise.all(
                    apt.service_ids.map((id) => ctx.db.get(id as any))
                );

                return {
                    ...apt,
                    client,
                    services: services.filter((s) => s !== null),
                };
            })
        );

        return enriched;
    },
});

// Get appointments for a specific date
export const getAppointmentsByDate = query({
    args: {
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const appointments = await ctx.db
            .query("appointments")
            .filter((q) => q.eq(q.field("date"), args.date))
            .collect();

        // Enrich with client details
        const enriched = await Promise.all(
            appointments.map(async (apt) => {
                const client = await ctx.db.get(apt.client_id);
                return { ...apt, client };
            })
        );

        return enriched;
    },
});

// Get all clients
export const getAllClients = query({
    args: {},
    handler: async (ctx) => {
        const clients = await ctx.db.query("clients").collect();
        return clients;
    },
});

// Search client by phone
export const getClientByPhone = query({
    args: {
        phone: v.string(),
    },
    handler: async (ctx, args) => {
        const client = await ctx.db
            .query("clients")
            .filter((q) => q.eq(q.field("phone"), args.phone))
            .first();

        return client;
    },
});
