"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import React, { useState, useEffect } from "react"

import { motion } from "framer-motion"

import { useAccount, useReadContract } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"

import { formatEther } from "viem"

import { Identity, Name } from "@coinbase/onchainkit/identity"

import { Skeleton } from "@/components/skeleton"

import { ABI, ADDRESS } from "@/contract"

import { MarketItem, NFTMetadata } from "@/lib/types"

const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL as string

export type NFTCardProps = {
  nft: MarketItem
  openListDialog?: (tokenId: bigint) => void
  openUnlistDialog?: (tokenId: bigint) => void
}

const NFTCard = ({
  nft: {
    tokenId,
    creator,
    currentOwner,
    price,
    royaltyFeePercent,
    isListed: initialIsListed,
  },
  openListDialog,
  openUnlistDialog,
}: NFTCardProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const [fileURL, setFileURL] = useState<string>("")
  const [nftName, setNftName] = useState<string>("")
  const [nftDesc, setNftDesc] = useState<string>("")

  const [isListed, setIsListed] = useState<boolean>(initialIsListed)

  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const { address: accountAddress } = useAccount()

  const isProfilePage = pathname === "/profile"

  // READ - Get token URI and use it to get the file URL (image/gif/audio)
  const { data: tokenURIData, status: tokenURIStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
    chainId: baseSepolia.id,
  })
  useEffect(() => {
    const getFileURL = async () => {
      if (tokenURIData) {
        try {
          const jsonURL = `https://${gatewayURL}/ipfs/${tokenURIData}`

          const res = await fetch(jsonURL)
          const jsonMetaData = await res.json()

          // Check and update the fileURL if imgUrl exists and starts with ipfs://
          if (jsonMetaData.image && jsonMetaData.image.startsWith("ipfs://")) {
            const ipfsHash = jsonMetaData.image.split("ipfs://")[1]
            const pubURL = `https://${gatewayURL}/ipfs/${ipfsHash}`

            // Set the file URL state
            setFileURL(pubURL)
            // console.log("Updated File URI:", pubURL)
          } else {
            console.log("imgUrl not found or does not start with ipfs://")
          }

          if (jsonMetaData.name) {
            const nftName = jsonMetaData.name
            setNftName(nftName)
          }

          if (jsonMetaData.description) {
            const nftDesc = jsonMetaData.description
            setNftDesc(nftDesc)
          }
        } catch (error) {
          console.error("Error fetching file URI:", error)
        }
      }
    }

    getFileURL()
  }, [tokenURIData, tokenURIStatus])

  const handleMoreBtn = () => {
    setIsMoreOpen((prev) => !prev)
  }

  const redirectToProfilePage = () => {
    router.push(`/profile`)
  }

  const redirectToTokenPage = () => {
    router.push(`/eth/asset/${ADDRESS}/${tokenId}`)
  }

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/eth/asset/${ADDRESS}/${tokenId}`)
      .then(
        () => {
          alert("Link copied to clipboard!")
        },
        (err) => {
          console.error("Failed to copy: ", err)
        }
      )
  }

  return (
    <article className="group relative flex flex-col rounded-radii-lg bg-elevation hover:bg-elevation-high card-shadow z-[2] overflow-hidden">
      <div
        onClick={redirectToTokenPage}
        className="relative cursor-pointer flex flex-col h-full"
      >
        <div className="pb-[100%] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative flex flex-col h-full justify-center group-hover:scale-110 transition-transform duration-[400ms]">
              {fileURL ? (
                <Image
                  alt={`${nftName} #${tokenId}`}
                  src={fileURL}
                  fill={true}
                  className="object-cover"
                  sizes="600"
                  priority={true}
                />
              ) : (
                <Skeleton className="absolute top-0 left-0 flex flex-col w-full h-full" />
              )}
            </div>
          </div>
        </div>
        <div className="grow relative flex flex-col justify-between p-4 font-sans text-foreground">
          <div className="flex flex-col">
            <div className="flex justify-between">
              {nftName ? (
                <span className="text-sm lg:text-base font-semibold">{`${nftName}`}</span>
              ) : (
                <Skeleton className="w-full h-5 lg:h-6 rounded-radii-skeleton" />
              )}
              {tokenId ? (
                <span className="text-sm lg:text-base font-mono ml-2">{`#${tokenId}`}</span>
              ) : (
                <Skeleton className="w-full h-5 lg:h-6 rounded-radii-skeleton" />
              )}
            </div>

            <div className="flex">
              <span className="text-sm text-foreground-muted-dark min-h-6">
                By
              </span>
              {creator ? (
                <Identity
                  address={creator}
                  className="bg-transparent py-0 px-0 break-all ml-1"
                  chain={baseSepolia}
                >
                  <Name
                    address={creator}
                    chain={base}
                    className="text-sm font-medium text-foreground-muted min-h-6"
                  />
                </Identity>
              ) : (
                <Skeleton className="w-[80%] h-6 rounded-radii-skeleton" />
              )}
            </div>

            <div className="min-h-6">
              {isListed && (
                <div className="flex items-center font-mono text-foreground">
                  {price ? (
                    <span className="text-base">{formatEther(price)}</span>
                  ) : (
                    <Skeleton className="min-w-16 h-6 rounded-radii-skeleton" />
                  )}

                  {/* <span className="text-base text-foreground-muted ml-2">
                    ETH
                  </span> */}
                  <span className="ml-1">
                    <svg
                      className="fill-foreground-muted-dark"
                      width="14px"
                      height="14px"
                      viewBox="0 0 24 24"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Ethereum Icon</title>
                      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          </div>

          {isListed && (
            <div className="hidden lg:flex mt-3">
              <span className="text-sm text-foreground-muted-dark">
                Listed by
              </span>
              {currentOwner ? (
                <Identity
                  address={currentOwner}
                  className="bg-transparent py-0 px-0 break-all ml-1"
                  chain={baseSepolia}
                >
                  <Name
                    address={currentOwner}
                    chain={base}
                    className="text-sm text-foreground-muted-dark"
                  ></Name>
                </Identity>
              ) : (
                <Skeleton className="w-full h-5 rounded-radii-skeleton" />
              )}
            </div>
          )}

          <div className="lg:hidden absolute bottom-0 left-0 w-full mt-2">
            <button
              onClick={handleMoreBtn}
              className="flex items-center justify-end w-full h-full px-3 py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                className="fill-foreground-muted-dark hover:fill-foreground"
              >
                <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`hidden lg:flex absolute ${isMoreOpen ? "bottom-0" : "-bottom-10"} group-hover:bottom-0 transition-all justify-center items-center bg-blue w-full h-9 font-sans`}
      >
        <button
          onClick={() => {
            if (isListed) {
              return accountAddress !== currentOwner
                ? redirectToTokenPage() // Buy NFT
                : isProfilePage
                  ? openUnlistDialog && openUnlistDialog(tokenId)
                  : redirectToProfilePage()
            } else {
              return accountAddress === currentOwner
                ? isProfilePage
                  ? openListDialog && openListDialog(tokenId)
                  : redirectToProfilePage()
                : redirectToTokenPage() // View NFT
            }
          }}
          className="grow flex items-center justify-center text-foreground text-sm font-semibold text-center hover:bg-blue-hover h-full"
        >
          {isListed
            ? accountAddress !== currentOwner
              ? "Buy NFT"
              : "Unlist from sale"
            : accountAddress === currentOwner
              ? "List for sale"
              : "View NFT"}
        </button>
        <button
          onClick={handleMoreBtn}
          className="shrink-0 flex items-center justify-center px-3 border-l border-white/60 hover:bg-blue-hover h-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            className="fill-white"
          >
            <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
          </svg>
        </button>
      </div>

      {isMoreOpen && (
        <motion.div
          initial={{
            boxShadow: "rgba(0, 0, 0, 0) 0px 6px 32px",
            opacity: 0,
          }}
          animate={{
            boxShadow: "rgba(0, 0, 0, 0.2) 0px 6px 32px",
            opacity: 1,
          }}
          exit={{
            boxShadow: "rgba(0, 0, 0, 0) 0px 6px 32px",
            opacity: 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute flex flex-col items-start rounded-radii-sm bottom-12 right-0 bg-elevation-higher text-foreground font-sans text-sm z-50 overflow-hidden"
        >
          <button
            onClick={() => {
              if (isListed) {
                return accountAddress !== currentOwner
                  ? redirectToTokenPage() // Buy NFT
                  : isProfilePage
                    ? openUnlistDialog && openUnlistDialog(tokenId)
                    : redirectToProfilePage()
              } else {
                return accountAddress === currentOwner
                  ? isProfilePage
                    ? openListDialog && openListDialog(tokenId)
                    : redirectToProfilePage()
                  : redirectToTokenPage() // View NFT
              }
            }}
            className="px-6 py-[0.875rem] hover:bg-white/5 w-full"
          >
            {isListed
              ? accountAddress !== currentOwner
                ? "Buy NFT"
                : "Unlist NFT"
              : accountAddress === currentOwner
                ? "List NFT"
                : "View NFT"}
          </button>
          <div className="relative w-full">
            <div className="absolute left-0 right-0 border-t border-white/10"></div>
          </div>
          <button
            onClick={handleCopy}
            className="px-6 py-[0.875rem] hover:bg-white/5 w-full"
          >
            Copy Link
          </button>
        </motion.div>
      )}
    </article>
  )
}

export default NFTCard
