import { mutation } from "./_generated/server";

export const createDefaultAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if admin already exists
        const existing = await ctx.db.query("admins").first();
        if (existing) {
            return "Admin account already exists.";
        }

        // Create Default Admin
        await ctx.db.insert("admins", {
            username: "admin",
            password: "password123"
        });

        return "✅ Admin initialized! Username: 'admin', Password: 'password123'. PLEASE CHANGE PASSWORD LATER.";
    },
});
