import Image from "next/image"
import Link from "next/link"

type HomeShowcaseProps = {
  locale: string
}

export const HomeShowcase = ({ locale }: HomeShowcaseProps) => {
  const isTurkish = locale === "tr"

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

            <Link
              href={`/${locale}/categories`}
              className="inline-flex rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-action-on-primary transition-colors hover:bg-action-hover"
            >
              {isTurkish ? "Hemen Al" : "Shop Now"}
            </Link>
          </div>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-action" />
            <span className="h-1.5 w-3 rounded-full bg-white/70" />
            <span className="h-1.5 w-3 rounded-full bg-white/70" />
          </div>
        </article>

        <div className="flex min-h-[500px] flex-col gap-3">
          <article className="flex flex-1 items-center justify-between rounded-lg bg-secondary p-5">
            <div className="max-w-[200px]">
              <h2 className="mb-2 text-2xl font-bold leading-tight">
                {isTurkish ? "Akıllı Ev" : "Smart Home"}
              </h2>
              <p className="text-sm text-secondary">
                {isTurkish ? (
                  <>
                    <span className="font-semibold text-action">$450</span>'ye varan indirim
                  </>
                ) : (
                  <>
                    Save up to <span className="font-semibold text-action">$450</span>
                  </>
                )}
              </p>
            </div>
            <Image
              src="/images/categories/accessories.png"
              alt="Smart home accessory"
              width={180}
              height={180}
              className="h-[136px] w-[136px] object-contain"
            />
          </article>

          <article className="flex flex-1 items-center justify-between rounded-lg bg-warning-secondary p-5">
            <div className="max-w-[200px]">
              <h2 className="mb-2 text-2xl font-bold leading-tight">Galaxy S24</h2>
              <p className="text-sm text-secondary">
                {isTurkish ? (
                  <>
                    <span className="font-semibold text-action">$600</span>'ye varan indirim
                  </>
                ) : (
                  <>
                    Save up to <span className="font-semibold text-action">$600</span>
                  </>
                )}
              </p>
            </div>
            <Image
              src="/images/categories/sport.png"
              alt="Featured smartphone"
              width={180}
              height={180}
              className="h-[136px] w-[136px] object-contain"
            />
          </article>
        </div>
      </div>
    </section>
  )
}
