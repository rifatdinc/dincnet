"use client"

import useEmblaCarousel from "embla-carousel-react"

import { Indicator } from "@/components/atoms"
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"
import { useCallback, useEffect, useState } from "react"
import { EmblaCarouselType } from "embla-carousel"
import tailwindConfig from "../../../../tailwind.config"

export const CustomCarousel = ({
  variant = "light",
  items,
  align = "start",
}: {
  variant?: "light" | "dark"
  items: React.ReactNode[]
  align?: "center" | "start" | "end"
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align,
    breakpoints: {
      "(min-width: 1024px)": { align: "start" },
    },
  })

  const [selectedIndex, setSelectedIndex] = useState(0)

  const maxStep = items.length

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on("reInit", onSelect).on("select", onSelect)
  }, [emblaApi, onSelect])

  const changeSlideHandler = useCallback(
    (index: number) => {
      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const arrowColor = {
    light: tailwindConfig.theme.extend.colors.primary,
    dark: tailwindConfig.theme.extend.colors.tertiary,
  }

  return (
    <div className="embla relative w-full flex justify-center group">
      <div
        className="embla__viewport overflow-hidden w-full"
        ref={emblaRef}
      >
        <div className="embla__container flex -ml-4">
          {items.map((slide, index) => (
            <div
              key={index}
              className="embla__slide pl-4 min-w-0 flex-[0_0_80%] sm:flex-[0_0_50%] md:flex-[0_0_40%] lg:flex-[0_0_25%]"
            >
              {slide}
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <button
            onClick={() => changeSlideHandler(selectedIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            disabled={selectedIndex === 0}
          >
            <ArrowLeftIcon color={arrowColor[variant]} />
          </button>
          <button
            onClick={() => changeSlideHandler(selectedIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            disabled={selectedIndex === items.length - 1}
          >
            <ArrowRightIcon color={arrowColor[variant]} />
          </button>
        </div>

        <div className="flex justify-between items-center mt-4 sm:hidden">
          <div className="w-1/2">
            <Indicator
              variant={variant}
              maxStep={maxStep}
              step={selectedIndex + 1}
            />
          </div>
          <div>
            <button onClick={() => changeSlideHandler(selectedIndex - 1)}>
              <ArrowLeftIcon color={arrowColor[variant]} />
            </button>
            <button onClick={() => changeSlideHandler(selectedIndex + 1)}>
              <ArrowRightIcon color={arrowColor[variant]} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
