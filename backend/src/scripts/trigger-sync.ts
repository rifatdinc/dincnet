import { ExecArgs } from "@medusajs/framework/types";
import syncSupplierJob from "../jobs/sync-supplier";

export default async function triggerSync({ container }: ExecArgs) {
    const logger = container.resolve("logger");

    logger.info("Triggering Sync Supplier Job manually...");

    await syncSupplierJob(container);

    logger.info("Manual trigger complete.");
}
