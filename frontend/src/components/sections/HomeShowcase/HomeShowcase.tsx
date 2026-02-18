import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"

type HomeShowcaseProps = {
  locale: string
  products?: HttpTypes.StoreProduct[]
}

export const HomeShowcase = ({ locale, products = [] }: HomeShowcaseProps) => {
  const isTurkish = locale === "tr"

  const firstProduct = products.length > 0 ? products[0] : null
  const secondProduct = products.length > 1 ? products[1] : null

  const ProductBlock = ({
    product,
    fallbackTitle,
    fallbackImage,
    bgColor
  }: {
    product: HttpTypes.StoreProduct | null
    fallbackTitle: string
    fallbackImage: string
    bgColor: string
  }) => {
    if (product) {
       const { cheapestPrice } = getProductPrice({ product })

       return (
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className={`flex flex-1 items-center justify-between rounded-lg ${bgColor} p-5 transition-transform hover:scale-[1.02]`}
          >
            <div className="max-w-[200px]">
              <h2 className="mb-2 text-xl font-bold leading-tight line-clamp-2">
                {product.title}
              </h2>
              <p className="text-sm text-secondary">
                 {cheapestPrice ? (
                    <>
                       {cheapestPrice.calculated_price !== cheapestPrice.original_price && (
                          <span className="line-through text-xs mr-2 opacity-60">{cheapestPrice.original_price}</span>
                       )}
                       <span className="font-semibold text-action">{cheapestPrice.calculated_price}</span>
                    </>
                 ) : (
                    <span className="font-semibold text-action">{isTurkish ? "İncele" : "Check it out"}</span>
                 )}
              </p>
            </div>
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={180}
                height={180}
                className="h-[136px] w-[136px] object-contain"
              />
            ) : (
              <Image
                src={fallbackImage}
                alt={product.title}
                width={180}
                height={180}
                className="h-[136px] w-[136px] object-contain opacity-80"
              />
            )}
          </LocalizedClientLink>
       )
    }

    // Fallback static content
    return (
        <article className={`flex flex-1 items-center justify-between rounded-lg ${bgColor} p-5`}>
            <div className="max-w-[200px]">
              <h2 className="mb-2 text-2xl font-bold leading-tight">
                {fallbackTitle}
              </h2>
              <p className="text-sm text-secondary">
                 {isTurkish ? "Yakında..." : "Coming soon..."}
              </p>
            </div>
            <Image
              src={fallbackImage}
              alt={fallbackTitle}
              width={180}
              height={180}
              className="h-[136px] w-[136px] object-contain opacity-50"
            />
          </article>
    )
  }

  return (
    <section className="container mt-4 w-full px-4 lg:px-8" data-testid="home-showcase">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
        <article className="relative min-h-[320px] overflow-hidden rounded-lg lg:min-h-[500px]">
          <Image
            src="/images/hero/Image.jpg"
            alt="Featured product"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 66vw, 100vw"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

          <div className="absolute left-6 top-7 z-10 max-w-[380px] text-tertiary lg:left-9 lg:top-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide">
              {isTurkish ? "Premium Tasarım" : "Premium Design"}
            </p>
            <h1 className="mb-3 text-3xl font-bold leading-tight lg:text-4xl">
              {isTurkish ? "DincNet Pazaryeri" : "DincNet Marketplace"}
            </h1>
            <p className="mb-5 text-xs lg:text-base">
              {isTurkish
                ? "Yeni nesil ürünleri keşfet, güvenli sipariş ver ve işini büyüt."
                : "Discover next-generation products, place secure orders, and grow your business."}
            </p>

            <LocalizedClientLink
              href={`/categories`}
              className="inline-flex rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-action-on-primary transition-colors hover:bg-action-hover"
            >
              {isTurkish ? "Hemen Al" : "Shop Now"}
            </LocalizedClientLink>
          </div>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-action" />
            <span className="h-1.5 w-3 rounded-full bg-white/70" />
            <span className="h-1.5 w-3 rounded-full bg-white/70" />
          </div>
        </article>

        <div className="flex min-h-[500px] flex-col gap-3">
          <ProductBlock
            product={firstProduct}
            fallbackTitle={isTurkish ? "Akıllı Ev" : "Smart Home"}
            fallbackImage="/images/categories/accessories.png"
            bgColor="bg-secondary"
          />
          <ProductBlock
            product={secondProduct}
            fallbackTitle="Galaxy S24"
            fallbackImage="/images/categories/sport.png"
            bgColor="bg-warning-secondary"
          />
        </div>
      </div>
    </section>
  )
}
