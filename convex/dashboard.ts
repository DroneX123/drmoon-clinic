import { query } from "./_generated/server";

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const today = new Date().toISOString().split('T')[0];

        // 1. Revenue (Consultations)
        const consultations = await ctx.db.query("consultations").collect();
        const totalRevenue = consultations.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);

        // 2. Expenses
        const expenses = await ctx.db.query("business_expenses").collect();
        const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 3. Profit
        const netProfit = totalRevenue - totalExpenses;

        // 4. Counts
        const pendingAppointments = await ctx.db
            .query("appointments")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        const todayAppointments = await ctx.db
            .query("appointments")
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "confirmed"),
                    q.eq(q.field("date"), today)
                )
            )
            .collect();

        // 5. Monthly Data (Simple aggregation for chart if needed later, just totals for now)

        return {
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: netProfit,
            pendingCount: pendingAppointments.length,
            todayCount: todayAppointments.length
        };
    },
});
