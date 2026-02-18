import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { Badge } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { NavbarSearch } from "@/components/molecules"
import { CartDropdown } from "@/components/cells/CartDropdown/CartDropdown"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { CollapseIcon, HeartIcon } from "@/icons"

export const Navbar = ({
  categories,
  parentCategories,
  isLoggedIn,
  wishlistCount,
  locale,
}: {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories: HttpTypes.StoreProductCategory[]
  isLoggedIn: boolean
  wishlistCount: number
  locale: string
}) => {
  const isTurkish = locale === "tr"
  const desktopLinks = [
    { label: isTurkish ? "Popüler" : "Popular", href: "/categories" },
    { label: isTurkish ? "Mağaza" : "Shop", href: "/categories" },
    { label: isTurkish ? "İletişim" : "Contact", href: "/contact" },
    { label: isTurkish ? "Sayfalar" : "Pages", href: "/" },
    { label: isTurkish ? "Bloglar" : "Blogs", href: "/" },
  ]

  return (
    <div className="w-full border-b" data-testid="navbar">
      <div className="hidden lg:block border-b">
        <div className="container flex items-center gap-3 py-3 lg:py-4">
          <LocalizedClientLink href="/" className="shrink-0 w-[120px] xl:w-[160px]" data-testid="header-logo-link-desktop">
            <Image
              src="/branding/dincnet-wordmark.svg"
              alt="Logo"
              width={190}
              height={48}
              className="h-auto w-full object-contain"
              priority
            />
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/categories"
            className="flex h-[44px] min-w-[170px] xl:min-w-[210px] items-center justify-between rounded-full border border-primary/20 px-4 text-base xl:text-lg font-medium"
          >
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex flex-col gap-1">
                <span className="h-0.5 w-4 bg-primary" />
                <span className="h-0.5 w-4 bg-primary" />
                <span className="h-0.5 w-4 bg-primary" />
              </span>
              {isTurkish ? "Tüm Kategoriler" : "All Categories"}
            </span>
            <CollapseIcon size={16} className="rotate-180" />
          </LocalizedClientLink>

          <div className="min-w-0 flex-1 max-w-[560px]">
            <NavbarSearch
              placeholder={isTurkish ? "Ne arıyorsunuz..." : "I am shopping for..."}
              inputClassName="rounded-full h-[44px] text-sm"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 xl:gap-4 shrink-0">
            <UserDropdown isLoggedIn={isLoggedIn} showLabel locale={locale} />

            <LocalizedClientLink href="/wishlist" className="relative" aria-label="Go to wishlist">
              <HeartIcon size={24} />
              <Badge className="absolute -right-2 -top-2 h-5 w-5 p-0">{wishlistCount}</Badge>
            </LocalizedClientLink>

            <CartDropdown />
          </div>
        </div>

        <div className="border-t">
          <div className="container flex items-center justify-between py-3 lg:py-4">
            <nav className="flex items-center gap-8" aria-label="Main links">
              {desktopLinks.map((link) => (
                <LocalizedClientLink
                  key={link.label}
                  href={link.href}
                  className="text-xl xl:text-2xl font-semibold leading-none"
                >
                  {link.label}
                  {((isTurkish && (link.label === "Sayfalar" || link.label === "Bloglar")) ||
                    (!isTurkish && (link.label === "Pages" || link.label === "Blogs"))) && (
                      <CollapseIcon size={16} className="inline-block ml-2 rotate-180 align-middle" />
                    )}
                </LocalizedClientLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-xl xl:text-2xl font-semibold leading-none">
                {isTurkish ? "Çok Satanlar" : "Best Selling"}
              </span>
              <Badge className="h-7 rounded-full px-3 text-xs uppercase">
                {isTurkish ? "İndirim" : "Sale"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden border-t px-4 py-4" data-testid="navbar-search-mobile">
        <NavbarSearch placeholder={isTurkish ? "Ne arıyorsunuz..." : "I am shopping for..."} />
      </div>
    </div>
  )
}
