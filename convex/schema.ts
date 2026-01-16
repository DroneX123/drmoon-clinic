import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // 0. ADMINS
    admins: defineTable({
        username: v.string(),
        password: v.string(),
    }),

    // 1. SERVICES
    services: defineTable({
        name: v.string(),
        category: v.string(), // "Visage", "Corps", "Peau"
        price: v.number(),
        description: v.optional(v.string()),
        duration_minutes: v.number(),
        is_active: v.boolean(),
    }),

    // 2. SUPPLIERS (Admin)
    suppliers: defineTable({
        name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        instagram: v.optional(v.string()),
    }),

    // 3. PRODUCTS - Stock Management (Admin)
    products: defineTable({
        name: v.string(),
        stock_quantity: v.number(),
        buy_price: v.number(), // Cost
        supplier_id: v.id("suppliers"),
    }),

    // 4. SERVICE RECIPES - Product Usage (Admin)
    service_recipes: defineTable({
        service_id: v.id("services"),
        product_id: v.id("products"),
        quantity_required: v.number(),
    }),

    // 5. CLIENTS
    clients: defineTable({
        first_name: v.string(),
        last_name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        instagram: v.optional(v.string()),
        notes: v.optional(v.string()),
    }),

    // 6. APPOINTMENTS - FIXED FOR MULTIPLE SERVICES + TIME
    appointments: defineTable({
        client_id: v.id("clients"),
        service_ids: v.array(v.id("services")), // ← MULTIPLE SERVICES
        date: v.string(), // "2026-01-15"
        time: v.string(), // "09:00" ← ADDED
        status: v.string(), // "pending", "confirmed", "completed", "cancelled"
        client_message: v.optional(v.string()),
    }),

    // 7. CONSULTATIONS - Revenue & Stock Usage (Admin)
    consultations: defineTable({
        appointment_id: v.id("appointments"),
        date: v.string(),
        admin_notes: v.optional(v.string()),

        // Stock Used
        products_used: v.array(
            v.object({
                product_id: v.id("products"),
                quantity: v.number(),
            })
        ),

        // Payment
        amount_paid: v.number(),
        payment_method: v.string(), // "Cash", "CIB"
        is_fully_paid: v.boolean(),
    }),

    // 8. BUSINESS EXPENSES - Overhead Costs (Admin)
    business_expenses: defineTable({
        title: v.string(),
        amount: v.number(),
        date: v.string(),
        category: v.string(), // "Utilities", "Rent", "Marketing"
        receipt_image_url: v.optional(v.string()),
    }),
});
