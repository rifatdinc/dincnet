"use client"

import {
  Badge,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { Dropdown } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ProfileIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"
import { useUnreads } from "@talkjs/react"
import { useState } from "react"

export const UserDropdown = ({
  isLoggedIn,
  showLabel = false,
  locale = "en",
}: {
  isLoggedIn: boolean
  showLabel?: boolean
  locale?: string
}) => {
  const [open, setOpen] = useState(false)
  const isTurkish = locale === "tr"

  const unreads = useUnreads()

  return (
    <div
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <LocalizedClientLink
        href={isLoggedIn ? "/user" : "/login"}
        className="relative inline-flex items-center gap-3"
        aria-label="Go to user profile"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20">
          <ProfileIcon size={18} />
        </span>
        {showLabel && (
          <span className="hidden xl:block leading-tight">
            <span className="block text-xs uppercase text-secondary">
              {isTurkish ? "Hesap" : "Account"}
            </span>
            <span className="block text-xl font-semibold">
              {isLoggedIn
                ? isTurkish
                  ? "Hesabım"
                  : "My Account"
                : isTurkish
                  ? "Giriş Yap / Kayıt Ol"
                  : "Sign In / Register"}
            </span>
          </span>
        )}
      </LocalizedClientLink>
      <Dropdown show={open}>
        {isLoggedIn ? (
          <div className="p-1">
            <div className="lg:w-[200px]">
              <h3 className="uppercase heading-xs border-b p-4">
                Your account
              </h3>
            </div>
            <NavigationItem href="/user/orders">Orders</NavigationItem>
            <NavigationItem href="/user/messages" className="relative">
              Messages
              {Boolean(unreads?.length) && (
                <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
                  {unreads?.length}
                </Badge>
              )}
            </NavigationItem>
            <NavigationItem href="/user/addresses">Addresses</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">Settings</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/login">Login</NavigationItem>
            <NavigationItem href="/register">Register</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
