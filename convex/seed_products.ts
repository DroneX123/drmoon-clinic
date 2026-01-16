import { mutation } from "./_generated/server";

export const seed = mutation({
    handler: async (ctx) => {
        const suppliers = await ctx.db.query("suppliers").collect();
        let supplierId;

        if (suppliers.length === 0) {
            supplierId = await ctx.db.insert("suppliers", {
                name: "PharmaEsthetic",
                phone: "0555123456",
                email: "contact@pharmaesthetic.dz",
            });
        } else {
            supplierId = suppliers[0]._id;
        }

        const products = [
            { name: "Botox Allergan (Vial)", stock_quantity: 50, buy_price: 15000, selling_price: 30000 },
            { name: "Stylage M (Filler)", stock_quantity: 30, buy_price: 12000, selling_price: 22000 },
            { name: "Profhilo", stock_quantity: 20, buy_price: 18000, selling_price: 35000 },
            { name: "Meso Cocktail Vitamin", stock_quantity: 100, buy_price: 2000, selling_price: 5000 },
            { name: "Numbing Cream (Lidocaine)", stock_quantity: 200, buy_price: 500, selling_price: 0 }, // Consumable (free or included)
        ];

        for (const p of products) {
            const existing = await ctx.db
                .query("products")
                .filter((q) => q.eq(q.field("name"), p.name))
                .first();

            if (!existing) {
                await ctx.db.insert("products", {
                    ...p,
                    supplier_id: supplierId,
                });
            }
        }
    },
});
