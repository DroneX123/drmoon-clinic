import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * CREATE APPOINTMENT
 * This combines creating a client + appointment in one transaction
 * Perfect for the booking form flow
 */
export const createAppointment = mutation({
    args: {
        // Client data
        firstName: v.string(),
        lastName: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        instagram: v.optional(v.string()),

        // Appointment data
        serviceIds: v.array(v.string()), // Array of service IDs
        date: v.string(), // "2026-01-15"
        time: v.string(), // "09:00"
        clientMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Check if client already exists by phone
        let clientId;
        const existingClient = await ctx.db
            .query("clients")
            .filter((q) => q.eq(q.field("phone"), args.phone))
            .first();

        if (existingClient) {
            clientId = existingClient._id;

            // Update client info if provided
            await ctx.db.patch(existingClient._id, {
                first_name: args.firstName,
                last_name: args.lastName,
                email: args.email,
                instagram: args.instagram,
            });
        } else {
            // Create new client
            clientId = await ctx.db.insert("clients", {
                first_name: args.firstName,
                last_name: args.lastName,
                phone: args.phone,
                email: args.email,
                instagram: args.instagram,
                notes: undefined,
            });
        }

        // 2. Create appointment
        const appointmentId = await ctx.db.insert("appointments", {
            client_id: clientId,
            service_ids: args.serviceIds as any, // Cast for Convex types
            date: args.date,
            time: args.time,
            status: "pending",
            client_message: args.clientMessage,
        });

        return {
            success: true,
            appointmentId,
            clientId,
        };
    },
});

/**
 * UPDATE APPOINTMENT STATUS
 * For admin panel: confirm, complete, or cancel appointments
 */
export const updateAppointmentStatus = mutation({
    args: {
        appointmentId: v.id("appointments"),
        status: v.string(), // "confirmed", "completed", "cancelled"
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.appointmentId, {
            status: args.status,
        });

        return { success: true };
    },
});
