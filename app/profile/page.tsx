"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { base, baseSepolia } from "wagmi/chains"

import { parseEther } from "viem"

import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance,
} from "@coinbase/onchainkit/identity"

import { ABI, ADDRESS } from "@/contract"

import WalletWrapper from "@/components/wallet"
import Gallery from "@/components/gallery"
import ListDialog from "@/components/listdialog"
import UnlistDialog from "@/components/unlistdialog"
import { Skeleton } from "@/components/skeleton"

import { MarketItem, NFTMetadata } from "@/lib/types"

const Profile = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<MarketItem[]>()
  const [listedNFTs, setListedNFTs] = useState<MarketItem[]>([])
  const [unlistedNFTs, setUnlistedNFTs] = useState<MarketItem[]>([])

  const [activeView, setActiveView] = useState<"listed" | "unlisted">("listed")

  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null)
  const [selectedListingPrice, setSelectedListingPrice] = useState<string>("")

  const listDialogRef = useRef<HTMLDialogElement | null>(null)
  const unlistDialogRef = useRef<HTMLDialogElement | null>(null)

  const {
    address: accountAddress,
    chainId: accountChainId,
    status: accountStatus,
  } = useAccount()

  // WRITE - For listing the NFT
  const {
    data: listHash,
    error: listError,
    isPending: listPending,
    writeContractAsync: listWriteContractAsync,
    reset: listReset,
  } = useWriteContract()
  const { isLoading: listConfirming, isSuccess: listConfirmed } =
    useWaitForTransactionReceipt({ hash: listHash })

  // WRITE - For unlisting the NFT
  const {
    data: unlistHash,
    error: unlistError,
    isPending: unlistPending,
    writeContractAsync: unlistWriteContractAsync,
    reset: unlistReset,
  } = useWriteContract()
  const { isLoading: unlistConfirming, isSuccess: unlistConfirmed } =
    useWaitForTransactionReceipt({ hash: unlistHash })

  // READ - Get all owned NFTs
  const {
    data: ownedNFTsData,
    status: ownedNFTsDataStatus,
    refetch: refetchOwnedNFTs,
    error: ownedNFTsError,
  } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "getNFTsOwnedByUser",
    args: [],
    // chainId: baseSepolia.id,
  })
  useEffect(() => {
    if (ownedNFTsData) {
      // console.log(ownedNFTsDataStatus, ownedNFTsData)
      setOwnedNFTs(ownedNFTsData as MarketItem[])

      // Separate the NFTs as listed and unlisted
      const listedNFTs = ownedNFTsData.filter(
        (nft: MarketItem) => nft.isListed === true
      )
      const unlistedNFTs = ownedNFTsData.filter(
        (nft: MarketItem) => nft.isListed === false
      )

      setListedNFTs(listedNFTs)
      setUnlistedNFTs(unlistedNFTs)
    }
  }, [ownedNFTsData])

  // EFFECT -  Refetch the ownedNFTsData on confirmation of listing/unlisting of NFT
  useEffect(() => {
    if (listConfirmed || unlistConfirmed) {
      refetchOwnedNFTs() // Trigger refetch when either listConfirmed or unlistConfirmed is true
    }
  }, [listConfirmed, unlistConfirmed])

  // OPEN List Dialog
  const openListDialog = (tokenId: bigint) => {
    setSelectedTokenId(tokenId)
    listReset()
    if (listDialogRef.current) listDialogRef.current.showModal()
  }

  // OPEN Unlist Dialog
  const openUnlistDialog = (tokenId: bigint) => {
    setSelectedTokenId(tokenId)
    unlistReset()
    if (unlistDialogRef.current) unlistDialogRef.current.showModal()
  }

  // CLOSE List/Unlist Dialog
  const closeDialog = () => {
    setSelectedTokenId(null)
    setSelectedListingPrice("")
    if (listDialogRef.current) listDialogRef.current.close()
    if (unlistDialogRef.current) unlistDialogRef.current.close()
  }

  // FUNCTION - List NFT
  const listNFT = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedTokenId) return
    try {
      e.preventDefault()
      const listPriceWei = parseEther(selectedListingPrice)
      const listTx = await listWriteContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "listNFT",
        args: [selectedTokenId, listPriceWei],
      })
      if (listTx && !listPending) {
        console.log("listTx Success")
      }
    } catch (e) {
      console.log("Error - listNFT: ", e)
    }
  }

  // FUNCTION - Unlist NFT
  const unlistNFT = async () => {
    if (!selectedTokenId) return
    try {
      const unlistTx = await unlistWriteContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "unlistNFT",
        args: [selectedTokenId],
      })
      if (unlistTx && !unlistPending) {
        console.log("unlistTx Success")
      }
    } catch (e) {
      console.log("Error - unlistNFT: ", e)
    }
  }

  if (accountStatus === "disconnected") {
    return (
      <div className="w-full flex flex-col gap-4 items-center justify-center pt-60 px-10 font-sans">
        <h1 className="text-base text-foreground-muted text-center">
          {`Please connect your wallet to access your profile :)`}
        </h1>
        <WalletWrapper
          className="rounded-radii-full px-[0.85rem] py-[0.4rem] transition-colors duration-200"
          text="Connect Wallet"
          withWalletAggregator={true}
        />
      </div>
    )
  }

  if (accountStatus === "connecting") {
    return (
      <div className="w-full flex flex-col gap-4 items-center justify-center pt-60 px-10 font-sans">
        <h1 className="text-base text-foreground-muted text-center">
          {`Connecting...`}
        </h1>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col w-full mx-auto px-4 py-[4.5rem] scr-1360:max-w-[1360px] scr-1360:mx-auto scr-1360:px-4 scr-1560:px-4">
      <section className="flex flex-col justify-center pt-[134px] gap-2 font-sans text-base">
        <div className="absolute top-[4.5rem] left-0 bg-elevation w-full h-48 -z-10"></div>
        <Avatar
          loadingComponent={
            <Skeleton className="w-28 h-28 rounded-radii-full bg-foreground-muted-dark/15" />
          }
          defaultComponent={
            <svg
              data-testid="ock-defaultAvatarSVG"
              role="img"
              aria-label="ock-defaultAvatarSVG"
              width="100%"
              height="100%"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full bg-foreground fill-background rounded-full"
            >
              <path d="M20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40ZM25.6641 13.9974C25.6641 10.8692 23.1282 8.33333 20.0001 8.33333C16.8719 8.33333 14.336 10.8692 14.336 13.9974C14.336 17.1256 16.8719 19.6615 20.0001 19.6615C23.1282 19.6615 25.6641 17.1256 25.6641 13.9974ZM11.3453 23.362L9.53476 28.1875C12.2141 30.8475 15.9019 32.493 19.974 32.5H20.026C24.0981 32.493 27.7859 30.8475 30.4653 28.1874L28.6547 23.362C28.0052 21.625 26.3589 20.4771 24.5162 20.4318C24.4557 20.4771 22.462 21.9271 20 21.9271C17.538 21.9271 15.5443 20.4771 15.4839 20.4318C13.6412 20.462 11.9948 21.625 11.3453 23.362Z"></path>
            </svg>
          }
          style={{
            filter: "drop-shadow(rgba(0, 0, 0, 0.25) 0px 10px 20px)",
          }}
          className="w-28 h-28 border border-foreground/50"
          address={accountAddress}
          chain={base}
        />

        <Identity
          address={accountAddress}
          className="bg-background hover:bg-transparent active:bg-transparent py-0 px-0 break-all"
          chain={baseSepolia}
        >
          <Name
            address={accountAddress}
            chain={base}
            className="text-3xl text-foreground mt-2 min-h-9"
          ></Name>
        </Identity>

        <Identity
          address={accountAddress}
          className="bg-background hover:bg-transparent active:bg-transparent py-0 px-0 max-w-64 break-all"
          hasCopyAddressOnClick={true}
          chain={baseSepolia}
        >
          <Address className="text-foreground-muted-dark text-base font-mono" />
          <EthBalance className="text-foreground-muted-dark text-base font-mono" />
        </Identity>
      </section>
      <section className="flex flex-col justify-center py-4 font-sans text-base text-foreground border-b border-white/5">
        <nav className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveView("listed")}
            className={`px-4 py-2 rounded-radii-full ${activeView === "listed" ? "bg-white/5 text-foreground" : "text-foreground-muted-dark"}`}
          >
            <span className="hover:text-foreground transition-colors">
              Listed
            </span>
            <span className="text-foreground-muted ml-2 font-mono">
              {listedNFTs?.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView("unlisted")}
            className={`px-4 py-2 rounded-radii-full ${activeView === "unlisted" ? "bg-white/5 text-foreground" : "text-foreground-muted-dark"}`}
          >
            <span className="hover:text-foreground transition-colors">
              Unlisted
            </span>
            <span className="text-foreground-muted ml-2 font-mono">
              {unlistedNFTs?.length}
            </span>
          </button>
        </nav>
      </section>
      <section className="flex flex-col justify-center mt-4 gap-2 font-mono text-base">
        <div className="flex flex-col gap-2 ">
          {activeView === "listed" && listedNFTs && (
            <Gallery
              openListDialog={openListDialog}
              openUnlistDialog={openUnlistDialog}
              itemsList={listedNFTs}
            />
          )}
          {activeView === "unlisted" && unlistedNFTs && (
            <Gallery
              openListDialog={openListDialog}
              openUnlistDialog={openUnlistDialog}
              itemsList={unlistedNFTs}
            />
          )}

          <>
            <ListDialog
              dialogRef={listDialogRef}
              listingPrice={selectedListingPrice}
              setListingPrice={setSelectedListingPrice}
              listNFT={listNFT}
              listPending={listPending}
              listConfirming={listConfirming}
              listConfirmed={listConfirmed}
              listHash={listHash}
              listError={listError}
              closeDialog={closeDialog}
            />
            <UnlistDialog
              dialogRef={unlistDialogRef}
              unlistNFT={unlistNFT}
              unlistPending={unlistPending}
              unlistConfirming={unlistConfirming}
              unlistConfirmed={unlistConfirmed}
              unlistHash={unlistHash}
              unlistError={unlistError}
              closeDialog={closeDialog}
            />
          </>
        </div>
      </section>
    </div>
  )
}

export default Profile
