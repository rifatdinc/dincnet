
const MedusaPackage = require("@medusajs/js-sdk");
const Medusa = MedusaPackage.default || MedusaPackage;

// Using the correct admin domain
const MEDUSA_BACKEND_URL = "https://admin.poyraznetwork.com";

const sdk = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    debug: true,
    // New Publishable Key
    publishableKey: "pk_a6514501e3aef2e55b50fa70a212f35467558fd0a0a86e5b1ccf3e46db170555",
});

async function main() {
    console.log(`Checking Inventory for Product...`);

    // We'll search for "ePMP" to find the relevant product
    const query = "ePMP";

    let regionId;
    try {
        const { regions } = await sdk.store.region.list();
        const trRegion = regions.find(r => r.countries.some(c => c.iso_2 === 'tr'));
        if (trRegion) {
            regionId = trRegion.id;
        }
    } catch (e) {
        console.error("Region fetch error:", e.message);
        return;
    }

    try {
        const { products } = await sdk.store.product.list({
            region_id: regionId,
            q: query,
            limit: 1,
            // Request inventory quantity specifically
            fields: "*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder"
        });

        if (products.length > 0) {
            const p = products[0];
            console.log(`\nProduct Found: ${p.title} (ID: ${p.id})`);
            const v = p.variants[0];
            if (v) {
                console.log("Variant Details:");
                console.log(`- Manage Inventory: ${v.manage_inventory}`);
                console.log(`- Allow Backorder: ${v.allow_backorder}`);
                console.log(`- Inventory Quantity: ${v.inventory_quantity}`);

                if (v.manage_inventory && !v.allow_backorder && v.inventory_quantity <= 0) {
                    console.log("\nDIAGNOSIS: Out of Stock because manage_inventory is ON, backorders OFF, and quantity is 0.");
                } else {
                    console.log("\nDIAGNOSIS: Inventory seems fine based on basic fields. Checking deeper...");
                }
            } else {
                console.log("No variants found.");
            }
        } else {
            console.log("Product not found.");
        }

    } catch (e) {
        console.error("Error fetching product:", e.message);
    }
}

main();
