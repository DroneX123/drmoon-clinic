import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get All Expenses
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("business_expenses").order("desc").collect();
    },
});

// Create Expense
export const createExpense = mutation({
    args: {
        title: v.string(),
        amount: v.number(),
        date: v.string(),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("business_expenses", {
            title: args.title,
            amount: args.amount,
            date: args.date,
            category: args.category,
        });
    },
});

// Update Expense
export const updateExpense = mutation({
    args: {
        id: v.id("business_expenses"),
        title: v.optional(v.string()),
        amount: v.optional(v.number()),
        date: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

// Delete Expense
export const deleteExpense = mutation({
    args: { id: v.id("business_expenses") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
