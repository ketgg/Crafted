"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { type ReactNode, useState } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { cookieToInitialState, type State, WagmiProvider } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"

import merge from "lodash.merge"

import {
  Theme,
  midnightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit"
import { OnchainKitProvider } from "@coinbase/onchainkit"

import { getConfig } from "@/configs/wagmi"

const myTheme = merge(midnightTheme(), {
  radii: {
    actionButton: "999px",
    connectButton: "0.05rem",
    menuButton: "0.05rem",
    modal: "0.05rem",
    modalMobile: "0.05rem",
  },
  fonts: {
    body: "var(--font-agrandir-narrow)",
  },
} as Theme)

export const Providers = ({
  children,
  cookie,
}: {
  children: ReactNode
  cookie: string
}) => {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())
  const initialState = cookieToInitialState(config, cookie)
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <RainbowKitProvider modalSize="compact" theme={myTheme}>
            {children}
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
