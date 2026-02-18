import { ProductDetails, ProductGallery } from "@/components/organisms"
import { listProducts, retrieveProduct } from "@/lib/data/products"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
  /* 
     First, we resolve the handle to an ID using listProducts.
     However, listProducts (store/products) does not return inventory_quantity in Medusa v2.
     So we must re-fetch the single product using retrieveProduct (store/products/:id) 
     which correctly computes inventory.
  */
  const listResult = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true,
  }).then(({ response }) => response.products[0])

  if (!listResult) return null

  const prod = await retrieveProduct({
    id: listResult.id,
    countryCode: locale
  }) || listResult


  if (!prod) return null

  return (
    <>
      <div className="flex flex-col md:flex-row lg:gap-12" data-testid="product-details-page">
        <div className="md:w-1/2 md:px-2" data-testid="product-gallery-container">
          <ProductGallery images={prod?.images || []} />
        </div>
        <div className="md:w-1/2 md:px-2" data-testid="product-details-container">
          <ProductDetails product={prod} locale={locale} />
        </div>
      </div>
      <div className="my-8">
        <HomeProductSection
          heading="More products"
          home
          locale={locale}
        />
      </div>
    </>
  )
}
