"use client"

import Link from "next/link"

import React, { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"
import { baseSepolia } from "wagmi/chains"

import { ABI, ADDRESS } from "@/contract"

import Hero from "@/components/hero"
import Gallery from "@/components/gallery"

import { MarketItem } from "@/lib/types"

const Home = () => {
  const [listedNFTs, setListedNFTs] = useState<MarketItem[]>()
  const [userListedNFTs, setUserListedNFTs] = useState<MarketItem[]>([])
  const [otherListedNFTs, setOtherListedNFTs] = useState<MarketItem[]>([])

  const { address: accountAddress } = useAccount()

  // READ - Get all owned NFTs
  const { data: listedNFTsData, status: listedNFTsDataStatus } =
    useReadContract({
      abi: ABI,
      address: ADDRESS,
      account: accountAddress,
      functionName: "getAllListedNFTs",
      args: [],
      chainId: baseSepolia.id,
    })
  useEffect(() => {
    if (listedNFTsData) {
      // console.log(listedNFTsDataStatus, listedNFTsData)
      setListedNFTs(listedNFTsData as MarketItem[])

      // Separate the NFTs listed by the current user and others
      const userNFTs = listedNFTsData.filter(
        (nft: MarketItem) => nft.currentOwner === accountAddress
      )
      const otherNFTs = listedNFTsData.filter(
        (nft: MarketItem) => nft.currentOwner !== accountAddress
      )

      setUserListedNFTs(userNFTs)
      setOtherListedNFTs(otherNFTs)
    }
  }, [listedNFTsData, accountAddress])

  return (
    <main className="relative">
      <Hero />

      <div className="relative flex flex-col w-full mx-auto px-4 py-16 scr-1360:max-w-[1360px] scr-1360:mx-auto scr-1360:px-4 scr-1560:px-4">
        <section className="flex flex-col justify-center font-sans text-base gap-6">
          <div className="flex flex-col gap-1 items-center justify-center pb-4 border-b border-white/[0.04]">
            <h1 className="text-4xl font-medium">Explore NFTs</h1>
            <p className="text-lg font-normal text-foreground-muted">
              Discover and buy NFTs created or listed by others.
            </p>
          </div>

          <div className="flex flex-col w-full">
            <Gallery itemsList={otherListedNFTs} />
          </div>

          {userListedNFTs.length > 0 && (
            <div className="flex flex-col gap-6 mt-10">
              <div className="flex flex-col gap-1 items-center justify-center pb-4 border-b border-white/[0.04]">
                <h1 className="text-4xl font-medium">NFTs Listed by You</h1>
                <div className="flex items-center text-base font-medium text-foreground-muted-dark">
                  <div>
                    Please go to the profile page to unlist or manage your NFTs
                    -
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center text-foreground ml-2 fill-none stroke-foreground hover:text-blue hover:stroke-blue"
                  >
                    <span>Profile</span>
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-[0.5px]"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col w-full">
                <Gallery itemsList={userListedNFTs} />
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Home
