import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import { CartDropdown, MobileNavbar, Navbar } from "@/components/cells"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"
import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"

export const Header = async ({ locale } : {
  locale: string
}) => {
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)
  const wishlist = await getUserWishlists({ countryCode: locale }).catch(() => ({ products: [] }))
  const wishlistCount = wishlist?.products?.length || 0

  const { categories, parentCategories } = (await listCategories({ query: { include_ancestors_tree: true } })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }
  return (
    <header data-testid="header">
      <div className="flex items-center justify-between py-2 px-4 md:px-5 lg:hidden" data-testid="header-top-mobile">
        <div className="flex items-center gap-2">
          <MobileNavbar
            parentCategories={parentCategories}
            categories={categories}
          />
          <LocalizedClientLink href="/" className="text-2xl font-bold" data-testid="header-logo-link">
            <Image
              src="/branding/dincnet-wordmark.png"
              width={112}
              height={32}
              className="h-auto w-auto object-contain"
              alt="Logo"
              priority
            />
          </LocalizedClientLink>
        </div>

        <div className="flex items-center justify-end gap-2" data-testid="header-actions-mobile">
          {isLoggedIn && <MessageButton />}
          <UserDropdown isLoggedIn={isLoggedIn} />
          <CartDropdown />
        </div>
      </div>

      <Navbar
        categories={categories}
        parentCategories={parentCategories}
        isLoggedIn={isLoggedIn}
        wishlistCount={wishlistCount}
        locale={locale}
      />
    </header>
  )
}
