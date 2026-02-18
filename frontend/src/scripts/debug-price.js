
const MedusaPackage = require("@medusajs/js-sdk");
const Medusa = MedusaPackage.default || MedusaPackage;

const MEDUSA_BACKEND_URL = "http://localhost:9000";
const PUBLISHABLE_KEY = "pk_f9afb41bb5bb818507d5966e1629ea4a19f5ec0135ccfc71e42fd5c7269cd6b9";

let sdk;
try {
    sdk = new Medusa({
        baseUrl: MEDUSA_BACKEND_URL,
        debug: true,
        publishableKey: PUBLISHABLE_KEY,
    });
} catch (e) {
    console.error("Failed to initialize Medusa:", e);
    process.exit(1);
}

async function main() {
    console.log("Fetching regions...");
    const { regions } = await sdk.client.fetch("/store/regions");
    const trRegion = regions.find(r => r.name === "Turkey" || r.countries.some(c => c.iso_2 === "tr"));

    if (!trRegion) {
        console.log("Region 'tr' not found. Available regions:", regions.map(r => `${r.name} (${r.id})`));
    } else {
        console.log("Found region:", trRegion.name, "ID:", trRegion.id, "Currency:", trRegion.currency_code);
    }

    const targetRegionId = trRegion ? trRegion.id : regions[0].id;
    console.log(`Fetching 5 random products for region '${targetRegionId}'...`);

    // General query without customer_group_id
    const query = {
        limit: 5,
        region_id: targetRegionId,
        fields: '+variants.calculated_price,+variants.inventory_quantity,+variants.original_price,*variants'
    };

    try {
        const { products } = await sdk.client.fetch("/store/products", {
            method: "GET",
            query: query
        });

        if (products.length === 0) {
            console.log("No products found.");
            return;
        }

        console.log(`Found ${products.length} products.`);

        products.forEach(product => {
            console.log(`\nProduct: ${product.title} (ID: ${product.id})`);
            if (product.variants) {
                product.variants.forEach(v => {
                    let priceFound = false;
                    if (v.calculated_price) {
                        const amount = v.calculated_price.calculated_amount;
                        const original = v.calculated_price.original_amount;
                        if (amount || original) {
                            console.log(`  -> Variant ${v.id}: ${amount} ${v.calculated_price.currency_code} (Inventory: ${v.inventory_quantity})`);
                            priceFound = true;
                        }
                    }

                    if (!priceFound) {
                        console.log(`  -> Variant ${v.id}: NO PRICE (Inventory: ${v.inventory_quantity})`);
                    }
                });
            } else {
                console.log("  -> No variants.");
            }
        });

    } catch (e) {
        console.error("Error fetching products:", e);
        if (e.response) {
            console.error("Response data:", e.response.data);
            if (e.response.data.errors) {
                console.error("Errors:", JSON.stringify(e.response.data.errors, null, 2));
            }
        }
    }
}

main();
