import "@coinbase/onchainkit/styles.css"
import "@/styles/globals.css"

import type { Metadata } from "next"
import localFont from "next/font/local"
import { headers } from "next/headers"

import { type ReactNode } from "react"

import { Providers } from "@/components/providers"
import Navbar from "@/components/navbar"

const agrandirNormal = localFont({
  src: "../assets/fonts/PPAgrandirNormal-Variable.ttf",
  variable: "--font-agrandir-normal",
})
const agrandirNarrow = localFont({
  src: "../assets/fonts/PPAgrandirNarrow-Variable.ttf",
  variable: "--font-agrandir-narrow",
})
const rightGroteskMono = localFont({
  src: "../assets/fonts/PPRightGroteskMono-Variable.ttf",
  variable: "--font-rg-mono",
})

export const metadata: Metadata = {
  title: "Crafted",
  description: "Crafted NFT Marketplace!",
}

export default function RootLayout(props: { children: ReactNode }) {
  const cookie = headers().get("cookie") ?? ""
  return (
    <html lang="en" className="">
      <body
        className={`${agrandirNormal.variable} ${agrandirNarrow.variable} ${rightGroteskMono.variable} min-w-48 bg-background text-foreground`}
      >
        <Providers cookie={cookie}>
          <Navbar />
          {props.children}
        </Providers>
      </body>
    </html>
  )
}
