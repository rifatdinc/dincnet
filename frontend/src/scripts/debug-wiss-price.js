
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
    console.log(`Checking Specific Product as GUEST (No Auth) on ${MEDUSA_BACKEND_URL} with new KEY...`);

    let regionId;
    try {
        const { regions } = await sdk.store.region.list();
        const trRegion = regions.find(r => r.countries.some(c => c.iso_2 === 'tr'));
        if (trRegion) {
            regionId = trRegion.id;
            console.log(`Found Turkey Region: ${regionId}`);
        }
    } catch (e) {
        console.error("Error fetching regions:", e.message);
        return;
    }

    try {
        // Fetching by query
        const { products } = await sdk.store.product.list({
            region_id: regionId,
            q: "WİSS", // Search for it
            limit: 1,
            fields: "*variants.calculated_price"
        });

        if (products.length > 0) {
            const p = products[0];
            console.log(`\nProduct Found: ${p.title} (ID: ${p.id})`);
            const variant = p.variants[0];
            if (variant && variant.calculated_price) {
                console.log(`  Price: ${variant.calculated_price.calculated_amount} ${variant.calculated_price.currency_code}`);
            } else {
                console.log("  Price: NULL (Still missing!)");
                console.log("  Variant Data:", JSON.stringify(variant, null, 2));
                if (variant.calculated_price) console.log("  Price Data:", JSON.stringify(variant.calculated_price, null, 2));
            }
        } else {
            console.log("Product not found via search.");
        }

    } catch (e) {
        console.error("Error fetching product:", e.message);
    }
}

main();
