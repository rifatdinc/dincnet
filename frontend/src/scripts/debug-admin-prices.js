
const MedusaPackage = require("@medusajs/js-sdk");
const Medusa = MedusaPackage.default || MedusaPackage;

const MEDUSA_BACKEND_URL = "http://localhost:9000";
// NOTE: Admin API requires an admin token, not a publishable key.
// For this script, we will try to use the publishable key on the Admin API (which might fail)
// If it fails, we need to instruct the user to provide an admin token or login.
// However, in a real server-side scenario (Next.js), we typically don't hide the admin token in the client code.
// We are simulating a server-side fetch where we might have access to an admin session or API token.
// Let's try to verify if we can fetch price lists at all.

const sdk = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    debug: true,
    publishableKey: "pk_f9afb41bb5bb818507d5966e1629ea4a19f5ec0135ccfc71e42fd5c7269cd6b9",
});

async function main() {
    console.log("Attempting to list Price Lists...");

    // Try to list price lists using Admin API
    // This will likely fail without an auth token, but let's see authentication requirements.
    try {
        // In JS SDK, admin methods are under sdk.admin
        const { price_lists } = await sdk.admin.priceList.list();
        console.log(`Found ${price_lists.length} price lists.`);

        price_lists.forEach(pl => {
            console.log(`ID: ${pl.id}, Name: ${pl.name}, Type: ${pl.type}, Status: ${pl.status}`);
            if (pl.customer_groups) {
                console.log(`  Customer Groups: ${pl.customer_groups.map(cg => cg.id).join(', ')}`);
            }
        });

    } catch (e) {
        console.error("Error listing price lists (likely auth):", e.message);
    }
}

main();
