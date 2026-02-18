import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import { SupplierClient } from "../services/supplier-client";
import {
    createProductsWorkflow,
    createProductCategoriesWorkflow,
    createCollectionsWorkflow
} from "@medusajs/medusa/core-flows";

export default async function syncSupplierJob(container: MedusaContainer) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const supplierClient = new SupplierClient(logger);

    logger.info("Sync Supplier: Job started.");

    try {
        // 1. RESOLVE DEPENDENCIES & CONFIG
        const productModule = container.resolve(Modules.PRODUCT);
        const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
        const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
        const inventoryModule = container.resolve(Modules.INVENTORY);

        // Get Default Sales Channel
        const [defaultSalesChannel] = await salesChannelModule.listSalesChannels({ name: "Default Sales Channel" });
        if (!defaultSalesChannel) {
            logger.warn("Sync Supplier: 'Default Sales Channel' not found. Skipping.");
            return;
        }

        // Get Default Stock Location
        const [stockLocation] = await stockLocationModule.listStockLocations({});
        if (!stockLocation) {
            logger.warn("Sync Supplier: No Stock Location found. Cannot sync inventory.");
            return;
        }

        // 2. SYNC COLLECTIONS
        logger.info("Sync Supplier: Fetching Collections...");
        // Fetch ALL collections (loop)
        let colOffset = 0;
        while (true) {
            const { collections, count } = await supplierClient.getCollections(200, colOffset);
            if (collections.length === 0) break;

            for (const rCol of collections) {
                const [localCol] = await (productModule as any).listProductCollections({ handle: rCol.handle });
                if (!localCol) {
                    await createCollectionsWorkflow(container).run({
                        input: { collections: [{ title: rCol.title, handle: rCol.handle }] }
                    });
                }
            }
            colOffset += 200;
            if (colOffset >= count) break;
        }

        // 3. SYNC CATEGORIES (Recursive)
        logger.info("Sync Supplier: Fetching Categories...");

        // Helper to sync category tree
        const syncCategoryTree = async (categories: any[], parentId: string | null = null) => {
            for (const rCat of categories) {
                // Check existance
                let [localCat] = await productModule.listProductCategories({ handle: rCat.handle });

                if (!localCat) {
                    const { result } = await createProductCategoriesWorkflow(container).run({
                        input: {
                            product_categories: [{
                                name: rCat.name,
                                handle: rCat.handle,
                                description: rCat.description,
                                is_active: rCat.is_active,
                                parent_category_id: parentId // Link to parent
                            }]
                        }
                    });
                    localCat = result[0];
                }

                // Sync Children
                if (rCat.category_children && rCat.category_children.length > 0) {
                    await syncCategoryTree(rCat.category_children, localCat.id);
                }
            }
        };

        // Fetch ALL root categories
        // The API returns a flat list or tree? 
        // /store/product-categories usually returns a list. 
        // If we want trees we might need to verify inputs.
        // Assuming /store/product-categories?parent_category_id=null gives roots if filter works,
        // or we just fetch ALL and rebuild?
        // Simpler approach: Fetch ALL, then sort by who has no parent, or just try to create.

        // Let's try fetching everything and assume handles are unique keys.
        // However, Medusa Category creation requires parent_id to be valid.
        // Strategy: 
        // 1. Fetch all categories.
        // 2. Sort by rank or depth? 
        // 3. Or just recurse if the API returns a tree.
        // The Medusa Store API returns a tree if we don't convert it?
        // Actually Store API returns list.

        // Better: Fetch all, store in map, build tree locally? 
        // Or just iterate: Create parents first?
        // Complex. Let's rely on `supplierClient.getCategories` returning top level?

        // Let's assume we can fetch large batch and check parents.
        // For now, let's fetch everything and iteratively create.

        let allCategories: any[] = [];
        let catOffset = 0;
        while (true) {
            const { product_categories, count } = await supplierClient.getCategories(200, catOffset);
            if (product_categories.length === 0) break;
            allCategories = [...allCategories, ...product_categories];
            catOffset += 200;
            if (catOffset >= count) break;
        }

        // Sort: Create those with parent_category_id = null first
        // Then those whose parent exists.
        // Simple loop implementation

        const createdCatIds = new Set<string>();
        // Pre-fill existing
        const existingCats = await productModule.listProductCategories({}, { take: 10000 });
        existingCats.forEach(c => createdCatIds.add(c.handle));

        let pass = 0;
        let madeProgress = true;

        while (madeProgress && allCategories.length > 0 && pass < 10) {
            madeProgress = false;
            pass++;
            const remaining: any[] = [];

            for (const cat of allCategories) {
                // If already exists (by handle), skip
                if (createdCatIds.has(cat.handle)) {
                    continue;
                }

                // If parent required but not yet created/known?
                // Remote `parent_category` object might be null.
                const parentHandle = cat.parent_category?.handle;

                // We need to find local parent ID if parent exists
                let localParentId: string | null = null;

                if (parentHandle) {
                    if (!createdCatIds.has(parentHandle)) {
                        // Parent not yet ready, push to next pass
                        remaining.push(cat);
                        continue;
                    }
                    // Find local ID
                    const [p] = await productModule.listProductCategories({ handle: parentHandle });
                    if (p) localParentId = p.id;
                }

                // Create
                try {
                    await createProductCategoriesWorkflow(container).run({
                        input: {
                            product_categories: [{
                                name: cat.name,
                                handle: cat.handle,
                                description: cat.description,
                                is_active: cat.is_active,
                                parent_category_id: localParentId
                            }]
                        }
                    });
                    createdCatIds.add(cat.handle);
                    madeProgress = true;
                } catch (e) {
                    logger.error(`Failed to create category ${cat.handle}: ${e.message}`);
                }
            }
            allCategories = remaining;
        }

        // 4. SYNC PRODUCTS (Unlimited)
        logger.info("Sync Supplier: Fetching Products...");
        const limit = 10;
        let offset = 0;

        while (true) {
            logger.info(`Sync Supplier: Products Offset ${offset}...`);
            const { products: remoteProducts, count } = await supplierClient.getProducts(limit, offset);

            if (remoteProducts.length === 0) break;

            for (const rProd of remoteProducts) {
                const [localProd] = await productModule.listProducts({ handle: rProd.handle });

                // Map Images
                const images = rProd.images.map((img: any) => ({ url: img.url }));

                // Map Categories (Link to created categories)
                // rProd.categories -> list of objects
                // We need their IDs
                const categoryIds: string[] = [];
                if (rProd.categories) {
                    for (const c of rProd.categories) {
                        const [locCat] = await productModule.listProductCategories({ handle: c.handle });
                        if (locCat) categoryIds.push(locCat.id);
                    }
                }

                // Map Options (Store them for lookup)
                const productOptionsMap = new Map<string, string>(); // ID -> Title
                let productOptionsInput = rProd.options.map((o: any) => {
                    productOptionsMap.set(o.id, o.title);
                    return { title: o.title, values: o.values.map((v: any) => v.value) };
                });

                // Map Variants
                const variantsInput = rProd.variants.map((v: any) => {
                    const remotePrice = v.calculated_price?.calculated_amount || v.original_price?.original_amount;

                    // Transform options array [{option_id, value}] to object { [Title]: Value }
                    const variantOptions: Record<string, string> = {};
                    if (Array.isArray(v.options)) {
                        v.options.forEach((opt: any) => {
                            const title = productOptionsMap.get(opt.option_id);
                            if (title) {
                                variantOptions[title] = opt.value;
                            }
                        });
                    } else if (typeof v.options === 'object') {
                        Object.assign(variantOptions, v.options);
                    }

                    if (Object.keys(variantOptions).length === 0 && Array.isArray(v.options) && v.options.length > 0) {
                        logger.warn(`Variant has options but mapping failed for ${v.sku}. Raw: ${JSON.stringify(v.options)}`);
                        logger.warn(`Product Options: ${JSON.stringify(rProd.options)}`);
                    }

                    return {
                        title: v.title,
                        sku: v.sku,
                        options: variantOptions,
                        prices: remotePrice ? [{ amount: remotePrice, currency_code: "try" }] : [],
                        manage_inventory: true,
                        allow_backorder: false,
                        inventory_quantity: v.inventory_quantity || 0
                    };
                });

                // FALLBACK: If options are empty but variants exist, create default option
                if (productOptionsInput.length === 0 && variantsInput.length > 0) {
                    const defaultOptionTitle = "Model";
                    productOptionsInput = [{ title: defaultOptionTitle, values: variantsInput.map((v: any) => v.title) }];

                    variantsInput.forEach((v: any) => {
                        v.options = { [defaultOptionTitle]: v.title };
                    });
                }

                if (!localProd) {
                    // CREATE
                    try {
                        const { result } = await createProductsWorkflow(container).run({
                            input: {
                                products: [{
                                    title: rProd.title,
                                    handle: rProd.handle,
                                    description: rProd.description,
                                    subtitle: rProd.subtitle,
                                    status: rProd.status || ProductStatus.PUBLISHED,
                                    images: images,
                                    options: productOptionsInput,
                                    variants: variantsInput,
                                    sales_channels: [{ id: defaultSalesChannel.id }],
                                    category_ids: categoryIds
                                }]
                            }
                        });

                        const createdProd = result[0];
                        const createdVariants = await (productModule as any).listProductVariants({ product_id: createdProd.id });

                        // SYNC STOCK
                        for (const variant of createdVariants) {
                            const rVariant = variantsInput.find((rv: any) => rv.sku === variant.sku);
                            if (rVariant && variant.inventory_items?.length) { // Wait, inventory_items not loaded?
                                // Workaround: list items by sku
                                const [inventoryItem] = await inventoryModule.listInventoryItems({ sku: variant.sku });

                                if (inventoryItem) {
                                    await inventoryModule.createInventoryLevels([{
                                        inventory_item_id: inventoryItem.id,
                                        location_id: stockLocation.id,
                                        stocked_quantity: rVariant.inventory_quantity
                                    }]);
                                }
                            }
                        }

                    } catch (e) {
                        logger.error(`Failed to create product ${rProd.handle}: ${e.message}`);
                    }

                } else {
                    // UPDATE Logic (Prices & Stock)
                    // Simplified: We assume product structure didn't change drastically.
                    const localVariants = await (productModule as any).listProductVariants({ product_id: localProd.id });

                    // Update Product Status if changed
                    const targetStatus = rProd.status || ProductStatus.PUBLISHED;
                    if (localProd.status !== targetStatus) {
                        await (productModule as any).updateProducts(localProd.id, { status: targetStatus });
                    }

                    for (const lVariant of localVariants) {
                        const rVariant = variantsInput.find((rv: any) => rv.sku === lVariant.sku);
                        if (!rVariant) continue;

                        // Update Stock Logic...
                        const [inventoryItem] = await inventoryModule.listInventoryItems({ sku: lVariant.sku });
                        if (inventoryItem) {
                            const [level] = await inventoryModule.listInventoryLevels({
                                inventory_item_id: inventoryItem.id,
                                location_id: stockLocation.id
                            });

                            if (level) {
                                await inventoryModule.updateInventoryLevels([{
                                    id: level.id,
                                    inventory_item_id: inventoryItem.id,
                                    location_id: stockLocation.id,
                                    stocked_quantity: rVariant.inventory_quantity
                                }]);
                            } else {
                                await inventoryModule.createInventoryLevels([{
                                    inventory_item_id: inventoryItem.id,
                                    location_id: stockLocation.id,
                                    stocked_quantity: rVariant.inventory_quantity
                                }]);
                            }
                        }
                    }
                }
            }

            offset += limit;
        }

        logger.info("Sync Supplier: Job completed successfully.");

    } catch (error) {
        logger.error(`Sync Supplier Job Critical Error: ${error.message}`);
    }
}

export const config = {
    name: "sync-supplier",
    schedule: "0 * * * *",
};
