
const MedusaPackage = require("@medusajs/js-sdk");
const Medusa = MedusaPackage.default || MedusaPackage;

const MEDUSA_BACKEND_URL = "http://localhost:9000";

const sdk = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    debug: true,
    publishableKey: "pk_f9afb41bb5bb818507d5966e1629ea4a19f5ec0135ccfc71e42fd5c7269cd6b9",
});

async function main() {
    console.log("Checking products as a GUEST (No Auth)...");

    // 1. Get Region (Turkey)
    let regionId;
    try {
        const { regions } = await sdk.store.region.list();
        const trRegion = regions.find(r => r.countries.some(c => c.iso_2 === 'tr'));
        if (trRegion) {
            regionId = trRegion.id;
            console.log(`Found Turkey Region: ${regionId}`);
        } else {
            console.error("Could not find TR region!");
            return;
        }
    } catch (e) {
        console.error("Error fetching regions:", e.message);
        return;
    }

    // 2. Fetch Products
    try {
        const { products } = await sdk.store.product.list({
            region_id: regionId,
            limit: 5,
            fields: "*variants.calculated_price"
        });

        console.log(`Fetched ${products.length} products.`);

        products.forEach(p => {
            console.log(`\nProduct: ${p.title}`);
            const variant = p.variants[0];
            if (variant) {
                if (variant.calculated_price) {
                    console.log(`  Price: ${variant.calculated_price.calculated_amount} ${variant.calculated_price.currency_code}`);
                    console.log(`  Type: ${variant.calculated_price.price_list_id ? "Price List (Special)" : "Base Price (General)"}`);
                } else {
                    console.log("  Price: NULL (Still missing!)");
                }
            } else {
                console.log("  No variants found.");
            }
        });

    } catch (e) {
        console.error("Error fetching products:", e.message);
    }
}

main();
