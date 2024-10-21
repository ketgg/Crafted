"use client"

import { cn } from "@coinbase/onchainkit/theme"

import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity"
import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet"

type WalletWrapperProps = {
  text?: string
  className?: string
  withWalletAggregator?: boolean
}

const WalletWrapper = ({
  className,
  text,
  withWalletAggregator = false,
}: WalletWrapperProps) => {
  return (
    <Wallet className="">
      <ConnectWallet
        withWalletAggregator={withWalletAggregator}
        className={cn("", className)}
      >
        <ConnectWalletText className="font-medium text-foreground">
          {text}
        </ConnectWalletText>
        <Avatar className="h-6 w-6" />
        <Name className="font-medium" />
      </ConnectWallet>
      <WalletDropdown className="rounded-radii-sm">
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick={true}>
          <Avatar />
          <Name />
          <Address className="font-mono" />
          <EthBalance className="font-mono" />
        </Identity>
        <WalletDropdownBasename />
        <WalletDropdownLink
          icon="wallet"
          target="_blank"
          href="https://wallet.coinbase.com"
        >
          Wallet
        </WalletDropdownLink>
        <WalletDropdownFundLink
          target="_blank"
          text="Fund"
          fundingUrl="https://wallet.coinbase.com/assets"
        />
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  )
}

export default WalletWrapper
