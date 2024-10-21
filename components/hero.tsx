"use client"

import { useRouter } from "next/navigation"

import React, { useState, useEffect } from "react"

import { motion } from "framer-motion"

import { formatEther } from "viem"

import { Name } from "@coinbase/onchainkit/identity"
import { base } from "viem/chains"

import Backdrop from "@/components/backdrop"
import FeaturedCard from "@/components/featured"

import { MarketItem } from "@/lib/types"

import { featuredTokenIds } from "@/data/featured"
import IdentityWrapper from "./identity"
import { Skeleton } from "./skeleton"

const Hero = () => {
  const router = useRouter()

  const [bgImageUrl, setBgImageUrl] = useState<string>("")
  const [selectedCard, setSelectedCard] = useState<bigint>(featuredTokenIds[0])
  const [hoveredCard, setHoveredCard] = useState<bigint | null>(null)

  const [nftName, setNftName] = useState<string>("")
  const [nftItem, setNftItem] = useState<MarketItem | null>(null)

  const handleCardClick = (url: string, tokenId: bigint) => {
    // setBgImageUrl(url)
    setSelectedCard(tokenId)
  }

  const handleCardHover = (tokenId: bigint) => {
    setHoveredCard(tokenId)
  }

  const handleCardHoverEnd = () => {
    setHoveredCard(null)
  }

  const redirectToTokenPage = () => {
    router.push(`/assets/ethereum/${selectedCard.toString()}`)
  }

  return (
    <section className="relative flex flex-col max-w-[1560px] w-full mx-auto overflow-hidden border-none">
      <Backdrop backdropUrl={bgImageUrl} className="" />

      <div className="flex flex-col w-full justify-end py-3 px-4 mt-[20rem] md:mt-[23.75rem] scr-1360:max-w-[1360px] scr-1360:mx-auto scr-1360:py-6 scr-1360:px-4 scr-1560:mt-[30rem] scr-1560:py-6 scr-1560:px-4">
        <h3 className="text-xl font-semibold font-sans">
          {nftName ? (
            nftName
          ) : (
            <Skeleton className="w-[480px] h-7 rounded-radii-skeleton" />
          )}
        </h3>
        <h4 className="text-base leading-5 h-5 font-sans mt-2">
          {nftItem ? (
            <Name
              address={nftItem.creator}
              chain={base}
              className="text-foreground"
            />
          ) : (
            <Skeleton className="w-[140px] h-full rounded-radii-skeleton mt-2" />
          )}
        </h4>

        <div className="flex justify-between md:justify-start mt-6">
          <div className="flex">
            <div className="flex flex-col w-2/5 md:w-[8.5rem] ">
              <span className="text-foreground-muted text-sm font-mono font-semibold">
                PRICE
              </span>
              <div className="flex items-center">
                {nftItem ? (
                  <span className="text-foreground text-base font-mono">
                    {`${formatEther(nftItem.price)}`}
                  </span>
                ) : (
                  <span className="text-foreground-muted text-base font-mono">
                    ...
                  </span>
                )}

                <span className="ml-1">
                  <svg
                    className="fill-foreground-muted"
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
            </div>
          </div>

          <button
            onClick={redirectToTokenPage}
            className="bg-black/40 backdrop-blur-md border border-white/10 flex items-center rounded-radii-sm text-sm font-sans font-semibold px-3 py-2 group hover:bg-foreground hover:text-black transition-colors duration-200"
          >
            <span>View</span>
            <span className="hidden md:inline md:ml-[0.35rem]">NFT</span>
            <svg
              className="fill-foreground group-hover:fill-background transition-colors duration-200 ml-1"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
            >
              <path d="M11.293 4.707 17.586 11H4v2h13.586l-6.293 6.293 1.414 1.414L21.414 12l-8.707-8.707-1.414 1.414z" />
            </svg>
          </button>
        </div>

        <div className="relative flex justify-center w-full">
          <div className="flex w-full-30px justify-between gap-2 mt-4 -mx-5 py-5 px-[1.125rem] overflow-x-auto overflow-visible">
            {featuredTokenIds.map((tokenId) => {
              const isSelected = selectedCard === tokenId
              const isHovered = hoveredCard === tokenId
              const isOtherHovered =
                hoveredCard !== null && hoveredCard !== tokenId

              return (
                <motion.div
                  key={tokenId}
                  animate={{
                    y:
                      isHovered || (!isHovered && !isOtherHovered && isSelected)
                        ? -8
                        : isSelected && isOtherHovered
                          ? 0
                          : 0,
                    transition: { duration: 0.3 },
                  }}
                  className="relative flex flex-col w-40 min-w-40 md:w-[19%] md:min-w-[19%] h-[6.75rem] md:h-[8.5rem] scr-1360:h-40 rounded-radii-sm cursor-pointer"
                  onMouseEnter={() => handleCardHover(tokenId)}
                  onMouseLeave={handleCardHoverEnd}
                >
                  <FeaturedCard
                    tokenId={tokenId}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    isOtherHovered={isOtherHovered}
                    onClick={handleCardClick}
                    setBackdropImg={(url) => setBgImageUrl(url)}
                    setSelNftName={(name) => setNftName(name)}
                    setSelNftItem={(item) => setNftItem(item)}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
