
const MedusaPackage = require("@medusajs/js-sdk");
const Medusa = MedusaPackage.default || MedusaPackage;

const MEDUSA_BACKEND_URL = "http://localhost:9000";

const sdk = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    debug: true,
    publishableKey: "pk_f9afb41bb5bb818507d5966e1629ea4a19f5ec0135ccfc71e42fd5c7269cd6b9",
});

async function main() {
    console.log("Attempting to login as admin with default credentials...");

    try {
        // Correct path for auth might be different depending on SDK version.
        // Let's inspect sdk structure or use fetch directly as fallback.

        console.log("SDK Admin keys:", Object.keys(sdk.admin || {}));

        // Try direct fetch if SDK method is elusive
        // POST /admin/auth/session or /admin/auth/token depending on version
        // Medusa V2 uses /auth/user/emailpass usually

        // Let's try standard JS SDK method if available, checking docs
        // sdk.admin.auth should exist

        if (sdk.admin && sdk.admin.auth && sdk.admin.auth.createSession) {
            const auth = await sdk.admin.auth.createSession({
                email: "admin@medusa-test.com",
                password: "supersecret"
            });
            console.log("Login successful via SDK!");
        } else {
            console.log("SDK admin.auth.createSession not found. Trying fetch...");
            const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/auth/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: "admin@medusa-test.com",
                    password: "supersecret"
                })
            });

            if (response.ok) {
                console.log("Login successful via fetch!");
                // Extract cookie or token
                // If cookie-based, subsequent requests need cookie jar
            } else {
                console.log(`Login failed via fetch: ${response.status} ${response.statusText}`);
                const text = await response.text();
                console.log(text);
            }
        }

    } catch (e) {
        console.error("Login process failed:", e.message);
    }
}

main();
