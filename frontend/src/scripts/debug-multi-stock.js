
const MedusaPackage = require("@medusajs/js-sdk");
const Medusa = MedusaPackage.default || MedusaPackage;

const MEDUSA_BACKEND_URL = "https://admin.poyraznetwork.com";

const sdk = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    debug: true,
    publishableKey: "pk_a6514501e3aef2e55b50fa70a212f35467558fd0a0a86e5b1ccf3e46db170555",
});

async function main() {
    console.log(`Checking Inventory for Multiple Products...`);

    let regionId;
    try {
        const { regions } = await sdk.store.region.list();
        const trRegion = regions.find(r => r.countries.some(c => c.iso_2 === 'tr'));
        if (trRegion) {
            regionId = trRegion.id;
            console.log(`Found TR Region: ${regionId}`);
        }
    } catch (e) {
        console.error("Region fetch error:", e.message);
    }

    try {
        // Test 1: Explicitly requesting variants.inventory_quantity
        console.log("--- Test 1 (List): fields: 'id,variants.inventory_quantity,variants.id', region_id: " + regionId + " ---");
        const res1 = await sdk.store.product.list({
            limit: 1,
            region_id: regionId,
            fields: "id,variants.inventory_quantity,variants.id"
        });
        if (res1.products[0]) {
            console.log("Variant in Test 1 (List):", res1.products[0].variants[0]);

            // Test 3: Retrieve specific product
            const pid = res1.products[0].id;
            console.log(`\n--- Test 3 (Retrieve): ID ${pid} ---`);
            const product = await sdk.store.product.retrieve(pid, {
                region_id: regionId,
                fields: "id,title,variants.inventory_quantity,variants.title,variants.id,variants.manage_inventory"
            });
            console.log("Variant in Test 3 (Retrieve):", product.product.variants[0]);
        }
    } catch (e) {
        console.error("Error fetching products:", e.message);
    }

    // Test 2: Standard request with expand (if supported in v2 SDK via extra query params?)
    // In v2 SDK, query params are passed directly. 
    try {
        console.log("--- Test 2: fields: '*variants' ---");
        const res2 = await sdk.store.product.list({
            limit: 1,
            fields: "*variants"
        });
        if (res2.products[0]) {
            console.log("Variant in Test 2:", res2.products[0].variants[0]);
        }
    } catch (e) {
        console.error("Error in Test 2:", e.message);
    }
}

main();
