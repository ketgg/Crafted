"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import React, { useState } from "react"

import { motion, useScroll, useMotionValueEvent } from "framer-motion"

import WalletWrapper from "@/components/wallet"
import HamburgerBtn from "@/components/hamburger"

const navItems = [
  {
    name: "Explore",
    route: "/explore",
  },
  {
    name: "Create",
    route: "/create",
  },
  {
    name: "Profile",
    route: "/profile",
  },
  {
    name: "GitHub",
    route: "https://github.com/kettogg/Project-Crafted",
  },
]

const Navbar = () => {
  const path = usePathname()

  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState<boolean>(false)

  const [menuOpen, setMenuOpen] = useState<boolean>(false) // Track if the menu is open

  useMotionValueEvent(scrollY, "change", (currScrollY) => {
    const prevScrollY = scrollY.getPrevious()
    if (prevScrollY && currScrollY > prevScrollY) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  const slideVariants = {
    open: {
      y: 0, // Slide down to original position
      transition: {
        duration: 0.4, // Animation duration
        ease: "easeInOut",
      },
    },
    closed: {
      y: "-100%", // Slide up and out of view
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ type: "tween", duration: 0.32 }}
      className={`fixed top-0 left-0 w-full h-[4.5rem] py-3 z-20 ${path === "/" ? "bg-base-alt/60 backdrop-blur-md" : "bg-base-alt"}`}
    >
      <div className="relative flex justify-between items-center scr-20:gap-32 max-w-[1360px] z-20 w-full h-full mx-auto px-4 scr-1560:px-4">
        <Link
          href="/"
          className="text-[2rem] font-sans font-medium tracking-tight"
        >
          Crafted.
        </Link>

        <div className="grow hidden md:block">
          <div className="flex items-center justify-between font-mono text-base tracking-tight">
            {navItems.map((item, index) => {
              return (
                <div key={index} className="px-2">
                  <Link
                    className={`${path === item.route ? "text-foreground" : "text-foreground-muted-dark"} hover:text-foreground transition-colors duration-200`}
                    href={item.route}
                  >
                    {item.name.toUpperCase()}
                  </Link>
                </div>
              )
            })}
            <div className="pl-2">
              <WalletWrapper
                className="rounded-radii-full px-[0.85rem] py-[0.4rem] transition-colors duration-200"
                text="Connect Wallet"
                withWalletAggregator={true}
              />
            </div>
          </div>
        </div>

        <HamburgerBtn
          className="md:hidden"
          speed={1.5}
          open={menuOpen}
          setOpen={setMenuOpen}
        />
      </div>
      {/* Sliding menu */}
      <motion.div
        className="fixed top-0 left-0 w-full min-h-36 h-[100vh] bg-background text-foreground z-10 shadow-lg"
        variants={slideVariants}
        initial="closed"
        animate={menuOpen ? "open" : "closed"}
      >
        <div className="flex flex-col items-center justify-center h-full tracking-tight font-mono">
          <div className="px-2 py-3">
            <WalletWrapper
              className="rounded-radii-full px-[0.85rem] py-[0.4rem] transition-colors duration-200"
              text="Connect Wallet"
              withWalletAggregator={true}
            />
          </div>
          {navItems.map((item, index) => {
            return (
              <div key={index} className="px-2 py-3">
                <Link
                  className={`${path === item.route ? "text-foreground" : "text-foreground-muted-dark"} hover:text-foreground transition-colors duration-200`}
                  href={item.route}
                >
                  {item.name.toUpperCase()}
                </Link>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default Navbar
