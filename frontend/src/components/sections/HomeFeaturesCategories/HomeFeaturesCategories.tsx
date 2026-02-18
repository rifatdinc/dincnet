import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import type { HttpTypes } from "@medusajs/types"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CreditIcon,
  HeadphoneIcon,
  RefreshIcon,
  TruckIcon,
} from "@/icons"

const browseCategories = [
  { name: { tr: "Sneaker", en: "Sneakers" }, handle: "sneakers" },
  { name: { tr: "Sandalet", en: "Sandals" }, handle: "sandals" },
  { name: { tr: "Bot", en: "Boots" }, handle: "boots" },
  { name: { tr: "Spor", en: "Sport" }, handle: "sport" },
  { name: { tr: "Aksesuar", en: "Accessories" }, handle: "accessories" },
  { name: { tr: "Gömlek", en: "Shirt" }, handle: "shirt" },
]

export const HomeFeaturesCategories = ({
  locale,
  categories = []
}: {
  locale: string
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const isTurkish = locale === "tr"

  const localizedServiceHighlights = [
    {
      title: isTurkish ? "Ücretsiz Kargo" : "Free Shipping",
      subtitle: isTurkish ? "$200 üzeri siparişlerde" : "For all orders $200",
      icon: TruckIcon,
    },
    {
      title: isTurkish ? "1'e 1 İade" : "1 & 1 Returns",
      subtitle: isTurkish ? "1 gün içinde iptal" : "Cancellation after 1 day",
      icon: RefreshIcon,
    },
    {
      title: isTurkish ? "%100 Güvenli Ödeme" : "100% Secure Payments",
      subtitle: isTurkish ? "Güvenli ödeme garantisi" : "Guarantee secure payments",
      icon: CreditIcon,
    },
    {
      title: isTurkish ? "7/24 Destek" : "24/7 Dedicated Support",
      subtitle: isTurkish ? "Her yerde ve her zaman" : "Anywhere & anytime",
      icon: HeadphoneIcon,
    },
  ]

  // Helper to resolve image
  const getCategoryImage = (handle: string) => {
    const knownHandles = ["sneakers", "sandals", "boots", "sport", "accessories", "shirt"]
    // If exact match
    if (knownHandles.includes(handle)) {
      return `/images/categories/${handle}.png`
    }
    // Simple heuristic or random fallback from known ones to make it look diverse
    // using hash of string to pick a deterministic image
    const index = handle.length % knownHandles.length
    return `/images/categories/${knownHandles[index]}.png`
  }

  // Determine which categories to show
  // If dynamic categories are passed, use them. Otherwise fallback to hardcoded list.
  const hasDynamicCategories = categories.length > 0

  const categoriesToDisplay = hasDynamicCategories
    ? categories.slice(0, 6)
    : browseCategories.map(c => ({
        id: c.handle,
        handle: c.handle,
        name: c.name[isTurkish ? "tr" : "en"],
        description: ""
      }))

  return (
    <section className="container py-6 lg:py-8">
      <div className="grid grid-cols-2 gap-4 border-b border-secondary/30 pb-6 lg:grid-cols-4 lg:gap-6 lg:pb-8">
        {localizedServiceHighlights.map((item) => {
          const Icon = item.icon

          return (
            <article key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">
                <Icon size={30} className="text-secondary" />
              </span>
              <div>
                <h3 className="text-xl font-semibold leading-tight lg:text-2xl">{item.title}</h3>
                <p className="mt-1 text-sm text-secondary">{item.subtitle}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="pt-7 lg:pt-9">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="heading-lg font-semibold">
            {isTurkish ? "Kategoriye Göre Keşfet" : "Browse by Category"}
          </h2>
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-secondary/30"
              aria-label="Previous category"
            >
              <ArrowLeftIcon size={18} color="currentColor" className="text-secondary" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-secondary/30"
              aria-label="Next category"
            >
              <ArrowRightIcon size={18} color="currentColor" className="text-secondary" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {categoriesToDisplay.map((category) => (
            <LocalizedClientLink
              key={category.handle}
              href={`/categories/${category.handle}`}
              className="group flex flex-col items-center"
            >
              <span className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-component-secondary transition-colors group-hover:bg-component-hover lg:h-[138px] lg:w-[138px]">
                <Image
                  src={getCategoryImage(category.handle)}
                  alt={category.name}
                  width={84}
                  height={84}
                  className="h-[84px] w-[84px] object-contain lg:h-[94px] lg:w-[94px]"
                />
              </span>
              <span className="mt-3 text-center text-xl font-semibold leading-tight lg:text-2xl line-clamp-1 break-all px-2">
                {category.name}
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
