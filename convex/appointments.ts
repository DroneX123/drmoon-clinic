import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to enrich appointment with client and service data
async function enrichAppointment(ctx: any, appt: any) {
    const client = await ctx.db.get(appt.client_id);
    const services = await Promise.all(
        appt.service_ids.map((id: any) => ctx.db.get(id))
    );
    return {
        ...appt,
        client,
        services: services.filter(Boolean),
    };
}

export const getPending = query({
    args: {},
    handler: async (ctx) => {
        const appointments = await ctx.db
            .query("appointments")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        // Sort by date/time? Ideally yes.
        // For now, client logic or simple sort.
        // appointments.sort(...)

        return Promise.all(appointments.map((appt) => enrichAppointment(ctx, appt)));
    },
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const appointments = await ctx.db
            .query("appointments")
            .collect();
        return Promise.all(appointments.map((appt) => enrichAppointment(ctx, appt)));
    },
});

export const updateStatus = mutation({
    args: { id: v.id("appointments"), status: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const getConfirmedByDate = query({
    args: { date: v.string() },
    handler: async (ctx, args) => {
        const appointments = await ctx.db
            .query("appointments")
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "confirmed"),
                    q.eq(q.field("date"), args.date)
                )
            )
            .collect();

        return Promise.all(appointments.map((appt) => enrichAppointment(ctx, appt)));
    },
});

export const confirmAppointment = mutation({
    args: {
        id: v.id("appointments"),
        date: v.string(),
        time: v.string(),
        serviceIds: v.optional(v.array(v.id("services"))),
    },
    handler: async (ctx, args) => {
        const updates: any = {
            status: "confirmed",
            date: args.date,
            time: args.time,
        };
        if (args.serviceIds) {
            updates.service_ids = args.serviceIds;
        }
        await ctx.db.patch(args.id, updates);
    },
});

export const createAppointment = mutation({
    args: {
        firstName: v.string(),
        lastName: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        instagram: v.optional(v.string()),
        serviceIds: v.array(v.id("services")),
        date: v.string(),
        time: v.string(),
        clientMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Check if client exists (by phone)
        const existingClient = await ctx.db
            .query("clients")
            .filter((q) => q.eq(q.field("phone"), args.phone))
            .first();

        let clientId;

        if (existingClient) {
            clientId = existingClient._id;
            // We could update info here if needed
        } else {
            clientId = await ctx.db.insert("clients", {
                first_name: args.firstName,
                last_name: args.lastName,
                phone: args.phone,
                email: args.email,
                instagram: args.instagram,
            });
        }

        return await ctx.db.insert("appointments", {
            client_id: clientId,
            service_ids: args.serviceIds,
            date: args.date,
            time: args.time,
            status: "pending",
            client_message: args.clientMessage,
        });
    },
});
