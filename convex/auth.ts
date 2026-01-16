import { query } from "./_generated/server";
import { v } from "convex/values";

export const login = query({
    args: { username: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("admins")
            .filter((q) => q.eq(q.field("username"), args.username))
            .first();

        if (!user) {
            return false;
        }

        // In a real app we would use bcrypt, but for this project plain text is accepted
        return user.password === args.password;
    },
});
