import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  LocationIcon,
  MessageIcon,
  XIcon,
} from "@/icons"

export function Footer({ locale = "en" }: { locale?: string }) {
  const isTurkish = locale === "tr"

  const accountLinks = [
    { label: isTurkish ? "Giriş / Kayıt" : "Login / Register", path: "/login" },
    { label: isTurkish ? "Sepet" : "Cart", path: "/cart" },
    { label: isTurkish ? "Favoriler" : "Wishlist", path: "/wishlist" },
    { label: isTurkish ? "Mağaza" : "Shop", path: "/categories" },
  ]

  const quickLinks = [
    { label: isTurkish ? "Gizlilik Politikası" : "Privacy Policy", path: "/" },
    { label: isTurkish ? "İade Politikası" : "Refund Policy", path: "/" },
    { label: isTurkish ? "Kullanım Koşulları" : "Terms of Use", path: "/" },
    { label: isTurkish ? "SSS" : "FAQ's", path: "/" },
    { label: isTurkish ? "İletişim" : "Contact", path: "/contact" },
  ]

  return (
    <footer className="w-full bg-primary mt-10 border-t border-secondary/20" data-testid="footer">
      <div className="px-4 lg:px-8 py-8 lg:py-10">
        <section className="mb-10 rounded-lg bg-action p-6 lg:p-10 text-tertiary">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[560px]">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                {isTurkish
                  ? "En Yeni Trendleri ve Fırsatları Kaçırmayın"
                  : "Don't Miss Out Latest Trends & Offers"}
              </h2>
              <p className="mt-3 text-sm lg:text-base text-tertiary/90">
                {isTurkish
                  ? "En güncel kampanya ve indirim kodlarını almak için kaydolun"
                  : "Register to receive news about the latest offers & discount codes"}
              </p>
            </div>

            <form className="flex w-full max-w-[520px] items-center gap-3">
              <input
                type="email"
                placeholder={isTurkish ? "E-posta adresinizi girin" : "Enter your email"}
                className="h-12 w-full rounded-full border border-transparent bg-primary px-5 text-primary placeholder:text-secondary focus:outline-none"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-action-secondary px-6 text-tertiary font-semibold hover:bg-action-secondary-hover transition-colors"
              >
                {isTurkish ? "Abone Ol" : "Subscribe"}
              </button>
            </form>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 pb-8">
          <article>
            <h3 className="text-2xl font-semibold mb-4">{isTurkish ? "Yardım & Destek" : "Help & Support"}</h3>
            <ul className="space-y-3 text-base text-secondary">
              <li className="flex items-start gap-3">
                <LocationIcon size={20} className="mt-0.5" color="currentColor" />
                <span>
                  685 Market Street, Las Vegas, LA 95820, United States.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MessageIcon size={20} className="mt-0.5" color="currentColor" />
                <span>(+099) 532-786-9843</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageIcon size={20} className="mt-0.5" color="currentColor" />
                <span>support@example.com</span>
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon size={20} color="currentColor" className="text-primary" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">
                <XIcon size={20} color="currentColor" className="text-primary" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon size={20} color="currentColor" className="text-primary" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedinIcon size={20} color="currentColor" className="text-primary" />
              </a>
            </div>
          </article>

          <article>
            <h3 className="text-2xl font-semibold mb-4">{isTurkish ? "Hesap" : "Account"}</h3>
            <nav className="space-y-3" aria-label="Account links">
              {accountLinks.map((link) => (
                <LocalizedClientLink key={link.label} href={link.path} className="block text-base text-secondary hover:text-primary">
                  {link.label}
                </LocalizedClientLink>
              ))}
            </nav>
          </article>

          <article>
            <h3 className="text-2xl font-semibold mb-4">{isTurkish ? "Hızlı Linkler" : "Quick Link"}</h3>
            <nav className="space-y-3" aria-label="Quick links">
              {quickLinks.map((link) => (
                <LocalizedClientLink key={link.label} href={link.path} className="block text-base text-secondary hover:text-primary">
                  {link.label}
                </LocalizedClientLink>
              ))}
            </nav>
          </article>

          <article>
            <h3 className="text-2xl font-semibold mb-4">{isTurkish ? "Uygulamayı İndir" : "Download App"}</h3>
            <p className="text-base text-secondary mb-4">
              {isTurkish ? "Uygulama ile yeni kullanıcılara özel avantajlar" : "Save $3 With App & New User only"}
            </p>

            <div className="space-y-3 max-w-[220px]">
              <button type="button" className="w-full rounded-lg bg-primary px-4 py-3 text-left border border-secondary/20 hover:bg-component transition-colors">
                <span className="block text-xs text-secondary">{isTurkish ? "İndir" : "Download on the"}</span>
                <span className="block text-lg font-semibold">App Store</span>
              </button>
              <button type="button" className="w-full rounded-lg bg-action-secondary px-4 py-3 text-left text-tertiary hover:bg-action-secondary-hover transition-colors">
                <span className="block text-xs text-tertiary/80">{isTurkish ? "Al" : "Get it on"}</span>
                <span className="block text-lg font-semibold">Google Play</span>
              </button>
            </div>
          </article>
        </section>
      </div>

      <div className="border-t border-secondary/20 px-4 lg:px-8 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-secondary">© 2026. {isTurkish ? "Tüm hakları saklıdır" : "All rights reserved"}.</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary mr-1">{isTurkish ? "Kabul Ediyoruz:" : "We Accept:"}</span>
            <span className="rounded-full border border-secondary/30 px-3 py-1 text-xs">Mastercard</span>
            <span className="rounded-full border border-secondary/30 px-3 py-1 text-xs">VISA</span>
            <span className="rounded-full border border-secondary/30 px-3 py-1 text-xs">PayPal</span>
            <span className="rounded-full border border-secondary/30 px-3 py-1 text-xs">Amex</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
