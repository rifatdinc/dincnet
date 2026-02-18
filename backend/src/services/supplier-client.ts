import { Logger } from "@medusajs/framework/types";

type SupplierConfig = {
    baseUrl: string;
    publishableKey: string;
    regionId: string;
};

// Default configuration based on our research
const DEFAULT_CONFIG: SupplierConfig = {
    baseUrl: "https://admin.poyraznetwork.com",
    publishableKey: "pk_a6514501e3aef2e55b50fa70a212f35467558fd0a0a86e5b1ccf3e46db170555",
    regionId: "reg_01KFQKZDT6FDNH5GT5GTFP1V8K", // Turkey
};

export class SupplierClient {
    private config: SupplierConfig;
    private logger: Logger;

    constructor(logger: Logger, config: Partial<SupplierConfig> = {}) {
        this.logger = logger;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        const url = new URL(`${this.config.baseUrl}${endpoint}`);

        // Add query params
        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined) {
                url.searchParams.append(key, String(params[key]));
            }
        });

        // Add publishable key header
        const headers = {
            "x-publishable-api-key": this.config.publishableKey,
            "Content-Type": "application/json",
        };

        try {
            const response = await fetch(url.toString(), { headers });

            if (!response.ok) {
                throw new Error(`Supplier API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.logger.error(`Failed to fetch from supplier: ${error.message}`);
            throw error;
        }
    }

    async getCollections(limit = 100, offset = 0) {
        return this.request<{ collections: any[]; count: number }>("/store/collections", {
            limit,
            offset,
        });
    }

    async getCategories(limit = 100, offset = 0) {
        return this.request<{ product_categories: any[]; count: number }>("/store/product-categories", {
            limit,
            offset,
            // We might want to fetch parent categories or use a specific strategy for trees
        });
    }

    /**
     * Fetches products with inventory quantity exposed.
     */
    async getProducts(limit = 50, offset = 0) {
        return this.request<{ products: any[]; count: number }>("/store/products", {
            limit,
            offset,
            region_id: this.config.regionId,
            // IMPORTANT: This parameter exposes the inventory quantity!
            fields: "+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
        });
    }
}
