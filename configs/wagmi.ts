import { http, cookieStorage, createStorage } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets"

const projectId = (process.env.NEXT_PUBLIC_WC_PROJECT_ID as string) ?? ""
if (!projectId) {
  const providerErrMessage =
    "To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable"
  throw new Error(providerErrMessage)
}

export const getConfig = () => {
  const wagmiConfig = getDefaultConfig({
    appName: "CRFTD",
    projectId: projectId,
    multiInjectedProviderDiscovery: false,
    chains: [base, baseSepolia],
    wallets: [
      {
        groupName: "Recommended Wallet",
        wallets: [coinbaseWallet],
      },
      {
        groupName: "Other Wallets",
        wallets: [metaMaskWallet, rainbowWallet],
      },
    ],
    ssr: true, // Uses server side rendering (SSR)
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  })

  return wagmiConfig
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
