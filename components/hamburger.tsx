"use client"

import React, { useEffect, useRef } from "react"
import lottie, { AnimationItem } from "lottie-web"

import { cn } from "@/lib/utils"

import animationData from "@/assets/lottie/hamburger.json"

type HamburgerBtnProps = {
  className?: string
  speed?: number // Animation Speed
  open: boolean
  setOpen: (open: boolean) => void
}

const HamburgerBtn = ({
  className,
  speed,
  open,
  setOpen,
}: HamburgerBtnProps) => {
  const animationContainer = useRef<HTMLDivElement | null>(null)
  const anim = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (animationContainer.current) {
      anim.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData,
      })
      speed && anim.current?.setSpeed(speed)
      return () => anim.current?.destroy()
    }
  }, [])

  const handleClick = () => {
    setOpen(!open)
    if (anim.current) {
      if (!open) {
        // Play the "open" animation (first half)
        anim.current.playSegments([0, 59], true)
      } else {
        // Play the "close" animation (second half)
        anim.current.playSegments([60, 119], true)
      }
    }
  }

  return (
    <button
      className={cn("", className)}
      onClick={handleClick}
      aria-label="Toggle Menu"
    >
      <div ref={animationContainer} style={{ width: 32, height: 32 }} />
    </button>
  )
}

export default HamburgerBtn
