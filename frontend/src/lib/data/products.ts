'use server';

import { HttpTypes } from '@medusajs/types';

import { sortProducts } from '@/lib/helpers/sort-products';
import { SortOptions } from '@/types/product';

import { sdk } from '../config';
import { getAuthHeaders } from './cookies';
import { getRegion, retrieveRegion } from './regions';

let supportsCustomerGroupQueryParam = true;

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  category_id,
  collection_id,
  forceCache = false
}: {
  pageParam?: number;
  queryParams?: HttpTypes.FindParams &
  HttpTypes.StoreProductParams & {
    handle?: string[];
  };
  category_id?: string;
  collection_id?: string;
  countryCode?: string;
  regionId?: string;
  forceCache?: boolean;
}): Promise<{
  response: {
    products: HttpTypes.StoreProduct[];
    count: number;
  };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> => {
  if (!countryCode && !regionId) {
    throw new Error('Country code or region ID is required');
  }

  const limit = queryParams?.limit || 12;
  const _pageParam = Math.max(pageParam, 1);
  const offset = (_pageParam - 1) * limit;

  let region: HttpTypes.StoreRegion | undefined | null;

  if (countryCode) {
    region = await getRegion(countryCode);
  } else {
    region = await retrieveRegion(regionId!);
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null
    };
  }

  const resolvedCountryCode =
    countryCode?.toLowerCase() || region.countries?.[0]?.iso_2 || process.env.NEXT_PUBLIC_DEFAULT_REGION;
  const forcedCustomerGroupId =
    process.env.MEDUSA_FORCE_CUSTOMER_GROUP_ID ||
    process.env.NEXT_PUBLIC_MEDUSA_FORCE_CUSTOMER_GROUP_ID;

  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders
  };

  const hasCustomerAuth = 'authorization' in authHeaders;
  const shouldAttemptForcedCustomerGroup =
    !!forcedCustomerGroupId && supportsCustomerGroupQueryParam;
  const hasForcedCustomerGroup = shouldAttemptForcedCustomerGroup;
  const useCached =
    !hasCustomerAuth &&
    !hasForcedCustomerGroup &&
    (forceCache || (limit <= 8 && !category_id && !collection_id));

  const baseQuery = {
    country_code: resolvedCountryCode,
    category_id,
    collection_id,
    limit,
    offset,
    region_id: region?.id,
    fields: '+variants.calculated_price,+variants.inventory_quantity,*variants',
    ...queryParams
  };

  const fetchProducts = (query: Record<string, any>) =>
    sdk.client.fetch<{
      products: HttpTypes.StoreProduct[];
      count: number;
    }>(`/store/products`, {
      method: 'GET',
      query,
      headers,
      next: useCached ? { revalidate: 60 } : undefined,
      cache: useCached ? 'force-cache' : 'no-cache'
    });

  const initialQuery = shouldAttemptForcedCustomerGroup
    ? { ...baseQuery, customer_group_id: [forcedCustomerGroupId] }
    : baseQuery;

  return fetchProducts(initialQuery)
    .catch(async (error: any) => {
      if (!shouldAttemptForcedCustomerGroup) {
        throw new Error('Failed to fetch products');
      }

      const errorMessage =
        error?.message || error?.response?.data?.message || error?.toString?.() || '';

      if (String(errorMessage).includes("Unrecognized fields: 'customer_group_id'")) {
        supportsCustomerGroupQueryParam = false;
      }

      return fetchProducts(baseQuery);
    })
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null;

      return {
        response: {
          products,
          count
        },
        nextPage: nextPage,
        queryParams
      };
    })
    .catch(() => {
      return {
        response: {
          products: [],
          count: 0
        },
        nextPage: 0,
        queryParams
      };
    });
};

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = 'created_at',
  countryCode,
  category_id,
  seller_id,
  collection_id
}: {
  page?: number;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  sortBy?: SortOptions;
  countryCode: string;
  category_id?: string;
  seller_id?: string;
  collection_id?: string;
}): Promise<{
  response: {
    products: HttpTypes.StoreProduct[];
    count: number;
  };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> => {
  const limit = queryParams?.limit || 12;

  const {
    response: { products, count }
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100
    },
    category_id,
    collection_id,
    countryCode
  });

  const filteredProducts = seller_id
    ? products.filter(product => product.seller?.id === seller_id)
    : products;

  const pricedProducts = filteredProducts.filter(prod =>
    prod.variants?.some(variant => variant.calculated_price !== null)
  );

  const sortedProducts = sortProducts(pricedProducts, sortBy);

  const pageParam = (page - 1) * limit;

  const nextPage = count > pageParam + limit ? pageParam + limit : null;

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit);

  return {
    response: {
      products: paginatedProducts,
      count
    },
    nextPage,
    queryParams
  };
};

export const searchProducts = async (params: {
  query?: string;
  page?: number;
  hitsPerPage?: number;
  filters?: string;
  facets?: string[];
  maxValuesPerFacet?: number;
  currency_code?: string;
  countryCode?: string;
  region_id?: string;
  customer_id?: string;
  customer_group_id?: string[];
}): Promise<{
  products: HttpTypes.StoreProduct[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  facets: Record<string, any>;
  processingTimeMS: number;
}> => {
  if (!params.countryCode && !params.region_id) {
    throw new Error('Country code or region ID is required');
  }

  let resolvedCountryCode = params.countryCode;

  if (!resolvedCountryCode && params.region_id) {
    const region = await retrieveRegion(params.region_id);
    resolvedCountryCode = region?.countries?.[0]?.iso_2;
  }

  if (!resolvedCountryCode && params.countryCode) {
    const region = await getRegion(params.countryCode);
    if (!region) {
      throw new Error(`Region not found for country code: ${params.countryCode}`);
    }
    resolvedCountryCode = region.countries?.[0]?.iso_2 || params.countryCode;
  }

  if (!resolvedCountryCode) {
    throw new Error('Country code could not be resolved');
  }

  const hitsPerPage = params.hitsPerPage || 12;
  const page = params.page || 0;
  const pageParam = page + 1;

  const {
    response: { products, count }
  } = await listProducts({
    pageParam,
    countryCode: resolvedCountryCode,
    queryParams: {
      limit: hitsPerPage,
      q: params.query
    }
  });

  const nbPages = count > 0 ? Math.ceil(count / hitsPerPage) : 0;

  return {
    products,
    nbHits: count,
    page,
    nbPages,
    hitsPerPage,
    facets: {},
    processingTimeMS: 0
  };
};

export const retrieveProduct = async ({
  id,
  countryCode,
  regionId
}: {
  id: string;
  countryCode?: string;
  regionId?: string;
}): Promise<HttpTypes.StoreProduct | null> => {

  if (!countryCode && !regionId) {
    throw new Error('Country code or region ID is required');
  }

  let region: HttpTypes.StoreRegion | undefined | null;

  if (countryCode) {
    region = await getRegion(countryCode);
  } else {
    region = await retrieveRegion(regionId!);
  }

  if (!region) {
    return null;
  }

  const resolvedCountryCode =
    countryCode?.toLowerCase() || region.countries?.[0]?.iso_2 || process.env.NEXT_PUBLIC_DEFAULT_REGION;
  const forcedCustomerGroupId =
    process.env.MEDUSA_FORCE_CUSTOMER_GROUP_ID ||
    process.env.NEXT_PUBLIC_MEDUSA_FORCE_CUSTOMER_GROUP_ID;

  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders
  };

  const shouldAttemptForcedCustomerGroup =
    !!forcedCustomerGroupId && supportsCustomerGroupQueryParam;

  const baseQuery: Record<string, any> = {
    country_code: resolvedCountryCode,
    region_id: region.id,
    fields: '+variants.calculated_price,+variants.inventory_quantity,*variants'
  };

  const query = shouldAttemptForcedCustomerGroup
    ? { ...baseQuery, customer_group_id: [forcedCustomerGroupId] }
    : baseQuery;

  try {
    const { product } = await sdk.client.fetch<{ product: HttpTypes.StoreProduct }>(`/store/products/${id}`, {
      method: 'GET',
      headers,
      query,
      next: { revalidate: 60 },
      cache: 'force-cache'
    });
    return product;
  } catch (error: any) {
    if (shouldAttemptForcedCustomerGroup) {
      const errorMessage = error?.message || '';
      if (String(errorMessage).includes("Unrecognized fields: 'customer_group_id'")) {
        supportsCustomerGroupQueryParam = false;
        // Retry without customer_group_id
        try {
          const { product } = await sdk.client.fetch<{ product: HttpTypes.StoreProduct }>(`/store/products/${id}`, {
            method: 'GET',
            headers,
            query: baseQuery,
            next: { revalidate: 60 },
            cache: 'force-cache'
          });
          return product;
        } catch (e) {
          console.error("Error retrieving product retry:", e);
          return null;
        }
      }
    }
    console.error("Error retrieving product:", error);
    return null;
  }
};
