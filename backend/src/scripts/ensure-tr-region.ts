import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createRegionsWorkflow } from "@medusajs/medusa/core-flows";

export default async function ensureTrRegion({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const regionModule = container.resolve(Modules.REGION);
    const storeModule = container.resolve(Modules.STORE);
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);

    logger.info("Checking for 'Turkey' region...");

    const regions = await regionModule.listRegions({
        currency_code: "try",
    });

    if (regions.length > 0) {
        logger.info(`Turkey region already exists (ID: ${regions[0].id}).`);
        return;
    }

    logger.info("Turkey region not found. Creating...");

    const [store] = await storeModule.listStores();
    const [defaultSalesChannel] = await salesChannelModule.listSalesChannels({
        name: "Default Sales Channel",
    });

    try {
        const { result } = await createRegionsWorkflow(container).run({
            input: {
                regions: [
                    {
                        name: "Turkey",
                        currency_code: "try",
                        countries: ["tr"],
                        payment_providers: ["pp_system_default"],
                        is_tax_inclusive: true,
                    },
                ],
            },
        });

        const trRegion = result[0];
        logger.info(`Successfully created Turkey region (ID: ${trRegion.id}).`);

        // Ensure it's available in the default sales channel? 
        // Usually Configured via API keys or manual linking, but basic region creation should be enough for public access if SC is default.

        logger.info("Done.");
    } catch (error) {
        logger.error(`Failed to create Turkey region: ${error.message}`);
    }
}
