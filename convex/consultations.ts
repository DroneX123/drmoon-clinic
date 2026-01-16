import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const completeAppointment = mutation({
    args: {
        appointmentId: v.id("appointments"),

        // Receipt Details
        productsUsed: v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
        })),
        finalAmount: v.number(),
        paymentMethod: v.string(), // "Cash", "CIB", etc.

        // Next Appointment (Optional)
        nextAppointmentDate: v.optional(v.string()),
        nextAppointmentTime: v.optional(v.string()),
        nextAppointmentServices: v.optional(v.array(v.id("services"))),

        // Updated Current Appointment (Optional)
        updatedCurrentServices: v.optional(v.array(v.id("services"))),

        // Notes
        adminNotes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { appointmentId, productsUsed, finalAmount, paymentMethod, nextAppointmentDate, nextAppointmentTime, adminNotes, nextAppointmentServices, updatedCurrentServices } = args;

        // 1. Get the appointment to ensure it exists and get client info
        const appointment = await ctx.db.get(appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        // 2. Transact Stock (Deduct)
        for (const item of productsUsed) {
            const product = await ctx.db.get(item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            if (product.stock_quantity < item.quantity) {
                // Warning: proceeding anyway but stock will go negative or we could throw error.
                // For admin convenience, we usually allow going negative or just warn.
                // Let's just deduct.
            }

            await ctx.db.patch(item.productId, {
                stock_quantity: product.stock_quantity - item.quantity,
            });
        }

        // 3. Create Consultation Record (Receipt)
        await ctx.db.insert("consultations", {
            appointment_id: appointmentId,
            date: new Date().toISOString().split('T')[0], // Today's date for the receipt
            admin_notes: adminNotes,
            products_used: productsUsed.map(p => ({ product_id: p.productId, quantity: p.quantity })),
            amount_paid: finalAmount,
            payment_method: paymentMethod,
            is_fully_paid: true, // Assuming generic full payment for now
        });

        // 4. Update Current Appointment Status -> "completed"
        // Also update admin notes if provided
        // Also update services if provided (admin edited them during consultation)
        await ctx.db.patch(appointmentId, {
            status: "completed",
            admin_notes: adminNotes ? adminNotes : appointment.admin_notes,
            service_ids: updatedCurrentServices ? updatedCurrentServices : appointment.service_ids,
        });

        // 5. Create Next Appointment (Optional)
        if (nextAppointmentDate && nextAppointmentTime) {
            await ctx.db.insert("appointments", {
                client_id: appointment.client_id,
                service_ids: nextAppointmentServices ? nextAppointmentServices : appointment.service_ids,
                status: "confirmed", // Automatically confirmed as it's booked by admin
                date: nextAppointmentDate,
                time: nextAppointmentTime,
                admin_notes: "Follow-up appointment booked from receipt.",
            });
        }

        return "Appointment completed successfully";
    },
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const consultations = await ctx.db.query("consultations").order("desc").collect();

        // Enrich with client and appointment details
        return Promise.all(consultations.map(async (c) => {
            const appointment = await ctx.db.get(c.appointment_id);
            let client = null;
            let services = [];

            if (appointment) {
                client = await ctx.db.get(appointment.client_id);
                services = await Promise.all(
                    appointment.service_ids.map((id: any) => ctx.db.get(id))
                );
            }

            return {
                ...c,
                client,
                appointment,
                services: services.filter(Boolean),
            };
        }));
    },
});
