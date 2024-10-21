"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import React, { useState, useEffect } from "react"

import {
  Avatar,
  Identity,
  Name,
  Badge,
  Address,
} from "@coinbase/onchainkit/identity"
import { base, baseSepolia } from "wagmi/chains"

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { type BaseError } from "wagmi"

import NFTCard from "@/components/nftcard"
import { Skeleton } from "@/components/skeleton"

import { ABI, ADDRESS } from "@/contract"

import { cn } from "@/lib/utils"

import { MarketItem } from "@/lib/types"
import { formatEther } from "viem"

const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL as string

type NftItemPageProps = {
  params: {
    id: string
  }
}

const NftItemPage = ({ params }: NftItemPageProps) => {
  const router = useRouter()

  const [isTokenIdValid, setIsTokenIdValid] = useState<boolean>(true)
  const [tokenCount, setTokenCount] = useState<bigint | null>(null)

  const [nftItem, setNftItem] = useState<MarketItem>()

  const [fileURL, setFileURL] = useState<string>("")
  const [nftName, setNftName] = useState<string>("")
  const [nftDesc, setNftDesc] = useState<string>("")

  const { address: accountAddress } = useAccount()

  const tokenId: bigint = (() => {
    try {
      return BigInt(params.id)
    } catch {
      return BigInt(-1) // Invalid tokenId
    }
  })()

  const { data: tokenCountData, status: tokenCountStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "tokenCount",
    args: [],
  })
  useEffect(() => {
    if (tokenCountData) {
      // console.log(tokenCountData)
      setTokenCount(tokenCountData)
    }
  }, [tokenCountData])

  // Check tokenId validity
  useEffect(() => {
    if (tokenCount !== null && (tokenId <= BigInt(0) || tokenId > tokenCount)) {
      setIsTokenIdValid(false)
    } else {
      setIsTokenIdValid(true)
    }
  }, [tokenId, tokenCount])

  // READ - Get the NFT Data
  const { data: nftItemData, status: nftItemStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "tokenIdToMarketItem",
    args: [tokenId],
    query: {
      enabled:
        isTokenIdValid &&
        tokenCount !== null &&
        tokenId > BigInt(0) &&
        tokenId <= tokenCount,
    },
  })
  useEffect(() => {
    if (nftItemData) {
      console.log(nftItemData)
      const nftItem: MarketItem = {
        tokenId: nftItemData[0],
        creator: nftItemData[1],
        currentOwner: nftItemData[2],
        price: nftItemData[3],
        royaltyFeePercent: nftItemData[4],
        isListed: nftItemData[5],
      }
      setNftItem(nftItem)
    }
  }, [nftItemData])

  // READ - Get token URI and use it to get the file URL (image/gif/audio)
  const { data: tokenURIData, status: tokenURIStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
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

  // WRITE - Buy the NFT
  const {
    data: buyHash,
    error: buyError,
    isPending: buyPending,
    writeContractAsync: buyWriteContractAsync,
  } = useWriteContract()
  const { isLoading: buyConfirming, isSuccess: buyConfirmed } =
    useWaitForTransactionReceipt({ hash: buyHash })

  const buyNFT = async (tokenId: bigint, itemPrice: bigint) => {
    try {
      const buyTx = await buyWriteContractAsync({
        abi: ABI,
        address: ADDRESS,
        functionName: "buyNFT",
        args: [tokenId],
        value: itemPrice,
      })
      if (buyTx && !buyPending) {
        console.log("buyTx Success")
        return
      }
    } catch (e) {
      console.log("Error while buying the NFT: ", e)
    }
  }

  const redirectToAccountPage = () => {
    router.push(`/profile`)
  }

  // Used to normalize the addresses :)
  function shrinkAddress(address: string): string {
    // Ensure the input is a valid Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error("Invalid Ethereum address")
    }

    const start = address.slice(0, 6) // First 4 characters after '0x'
    const end = address.slice(-4) // Last 4 characters

    // Return the contracted form
    return `${start}...${end}`
  }

  return (
    <div className="relative flex flex-col w-full mx-auto px-4 py-[4.5rem] scr-1360:max-w-[1360px] scr-1360:mx-auto scr-1360:px-4 scr-1560:px-4 font-sans">
      <section className="flex flex-col sm:flex-row mt-6 gap-4">
        <div className="flex flex-col gap-4 grow-[3] min-w-[40%] sm:max-w-[45%] overflow-hidden">
          <article className="flex flex-col w-full rounded-radii-sm border border-white/[0.08] overflow-hidden">
            <header className="flex items-center justify-between p-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 111 111"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                  fill="white"
                />
              </svg>
              <Link
                href={fileURL}
                target="_blank"
                className="flex items-center justify-center text-blue-light fill-blue-light hover:text-blue-hover hover:fill-blue-hover"
              >
                <span className="text-sm font-medium">View original</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 -960 960 960"
                  className="ml-1"
                >
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
                </svg>
              </Link>
            </header>
            <div className="relative w-full aspect-square">
              <Image
                alt={`${nftName}#${nftItem?.tokenId}`}
                src={fileURL}
                fill={true}
                className="object-contain object-center"
              />
            </div>
          </article>
        </div>
        <div className="relative flex flex-col grow-[4]">
          <h2 className="text-4xl font-semibold mb-4">
            {nftItem ? (
              <div>
                {nftName} #{nftItem?.tokenId.toString()}
              </div>
            ) : (
              <Skeleton className="w-[50%] h-10 rounded-radii-skeleton" />
            )}
          </h2>
          <div className="flex flex-wrap items-center mb-4">
            <div className="flex gap-2 items-center mr-4 mb-1">
              {nftItem ? (
                <Avatar
                  loadingComponent={
                    <Skeleton className="w-10 h-10 rounded-full" />
                  }
                  defaultComponent={
                    <svg
                      data-testid="ock-defaultAvatarSVG"
                      role="img"
                      aria-label="ock-defaultAvatarSVG"
                      width={40}
                      height={40}
                      viewBox="0 0 40 40"
                      xmlns="http://www.w3.org/2000/svg"
                      className="fill-foreground bg-background"
                    >
                      <path d="M20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40ZM25.6641 13.9974C25.6641 10.8692 23.1282 8.33333 20.0001 8.33333C16.8719 8.33333 14.336 10.8692 14.336 13.9974C14.336 17.1256 16.8719 19.6615 20.0001 19.6615C23.1282 19.6615 25.6641 17.1256 25.6641 13.9974ZM11.3453 23.362L9.53476 28.1875C12.2141 30.8475 15.9019 32.493 19.974 32.5H20.026C24.0981 32.493 27.7859 30.8475 30.4653 28.1874L28.6547 23.362C28.0052 21.625 26.3589 20.4771 24.5162 20.4318C24.4557 20.4771 22.462 21.9271 20 21.9271C17.538 21.9271 15.5443 20.4771 15.4839 20.4318C13.6412 20.462 11.9948 21.625 11.3453 23.362Z" />
                    </svg>
                  }
                  className="w-10 h-10 avatar-drop-shadow"
                  address={nftItem.creator}
                  chain={base}
                />
              ) : (
                <Skeleton className="w-10 h-10 rounded-full" />
              )}
              <div className="realive flex flex-col justify-center py-1">
                <div className="text-[0.9375rem] text-foreground-muted-dark font-medium">
                  Creator
                </div>
                {nftItem ? (
                  <Identity
                    address={nftItem.creator}
                    className="bg-transparent py-0 px-0 break-all"
                    chain={baseSepolia}
                  >
                    <Name
                      address={nftItem.creator}
                      chain={base}
                      className="text-[0.9375rem] text-foreground font-semibold"
                    ></Name>
                  </Identity>
                ) : (
                  <Skeleton className="w-full h-5 rounded-radii-skeleton" />
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center mr-4 mb-1">
              {nftItem ? (
                <Avatar
                  loadingComponent={
                    <Skeleton className="w-10 h-10 rounded-full" />
                  }
                  defaultComponent={
                    <svg
                      data-testid="ock-defaultAvatarSVG"
                      role="img"
                      aria-label="ock-defaultAvatarSVG"
                      width={40}
                      height={40}
                      viewBox="0 0 40 40"
                      xmlns="http://www.w3.org/2000/svg"
                      className="fill-foreground bg-background"
                    >
                      <path d="M20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40ZM25.6641 13.9974C25.6641 10.8692 23.1282 8.33333 20.0001 8.33333C16.8719 8.33333 14.336 10.8692 14.336 13.9974C14.336 17.1256 16.8719 19.6615 20.0001 19.6615C23.1282 19.6615 25.6641 17.1256 25.6641 13.9974ZM11.3453 23.362L9.53476 28.1875C12.2141 30.8475 15.9019 32.493 19.974 32.5H20.026C24.0981 32.493 27.7859 30.8475 30.4653 28.1874L28.6547 23.362C28.0052 21.625 26.3589 20.4771 24.5162 20.4318C24.4557 20.4771 22.462 21.9271 20 21.9271C17.538 21.9271 15.5443 20.4771 15.4839 20.4318C13.6412 20.462 11.9948 21.625 11.3453 23.362Z" />
                    </svg>
                  }
                  className="w-10 h-10 avatar-drop-shadow"
                  address={nftItem.currentOwner}
                  chain={base}
                />
              ) : (
                <Skeleton className="w-10 h-10 rounded-full" />
              )}
              <div className="realive flex flex-col justify-center py-1">
                <div className="text-[0.9375rem] text-foreground-muted-dark font-medium">
                  Current Owner
                </div>
                {nftItem ? (
                  <Identity
                    address={nftItem.currentOwner}
                    className="bg-transparent py-0 px-0 break-all"
                    chain={baseSepolia}
                  >
                    <Name
                      address={nftItem.currentOwner}
                      chain={base}
                      className="text-[0.9375rem] text-foreground font-semibold"
                    ></Name>
                  </Identity>
                ) : (
                  <Skeleton className="w-full h-5 rounded-radii-skeleton" />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full rounded-radii-sm border border-white/[0.08] overflow-hidden mb-4">
            <div className="flex items-center p-5 border-b border-white/[0.08]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
                className="mr-2"
              >
                <path d="M160-200v-80h400v80H160Zm0-160v-80h640v80H160Zm0-160v-80h640v80H160Zm0-160v-80h640v80H160Z" />
              </svg>
              <h4 className="text-lg font-semibold text-foreground">
                Description
              </h4>
            </div>
            <div className="p-6">{nftDesc}</div>
          </div>
          <div className="flex flex-col gap-1 w-full p-5 rounded-radii-sm border border-white/[0.08] overflow-hidden mb-4">
            <div className="text-sm font-semibold text-foreground-muted-dark">
              Current Price
            </div>
            {nftItem ? (
              nftItem.isListed ? (
                <div className="flex text-3xl font-mono tracking-tight items-center">
                  {formatEther(nftItem.price)}
                  <span className="ml-1">
                    <svg
                      className="fill-foreground-muted-dark"
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Ethereum Icon</title>
                      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                    </svg>
                  </span>
                </div>
              ) : (
                <div className="flex text-3xl font-mono tracking-tight items-center text-foreground-muted">
                  Unlisted
                </div>
              )
            ) : (
              <Skeleton className="w-[50%] h-8 rounded-radii-skeleton" />
            )}
          </div>
          {nftItem?.isListed ? (
            accountAddress === nftItem.currentOwner ? (
              <div className="flex flex-wrap items-center text-foreground-muted-dark font-semibold mt-1 px-1">
                <span className="">Manage listings in your</span>
                <Link
                  href="/profile"
                  className="flex items-center text-foreground ml-1 fill-none stroke-foreground hover:text-blue hover:stroke-blue"
                >
                  <span>Profile</span>
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="mb-[0.5px]"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="flex items-center w-full mb-2">
                <button
                  onClick={() => buyNFT(nftItem.tokenId, nftItem.price)}
                  disabled={buyPending || buyConfirming || buyConfirmed}
                  className={cn(
                    `bg-blue text-foreground hover:bg-blue-hover`,
                    `${buyPending && "bg-white/5 hover:bg-white/5"}`,
                    `${buyConfirming && "bg-white/5 hover:bg-white/5"}`,
                    `${buyConfirmed && "bg-white/5 hover:bg-white/5"}`,
                    "px-6 py-[0.625rem] rounded-radii-full font-semibold text-base disabled:cursor-not-allowed"
                  )}
                >
                  {buyPending
                    ? "Buying..."
                    : buyConfirming
                      ? "Confirming..."
                      : buyConfirmed
                        ? "Buying Confirmed!"
                        : "Buy NFT"}
                </button>
              </div>
            )
          ) : accountAddress === nftItem?.currentOwner ? (
            <div className="flex flex-wrap items-center text-foreground-muted-dark font-semibold mt-1 px-1">
              <span className="">Manage listings in your</span>
              <Link
                href="/profile"
                className="flex items-center text-foreground ml-1 fill-none stroke-foreground hover:text-blue hover:stroke-blue"
              >
                <span>Profile</span>
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="mb-[0.5px]"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </Link>
            </div>
          ) : (
            <></>
          )}
          <div className="flex flex-col text-sm font-medium text-foreground-muted-dark break-words">
            {buyHash && <div className="">Transaction Hash: {buyHash}</div>}
            {buyConfirming && <div>Waiting for confirmation...</div>}
            {buyConfirmed && (
              <div className="text-blue">Transaction confirmed.</div>
            )}
            {buyError && (
              <div className="text-red-alt font-medium">
                Error:{" "}
                {(buyError as BaseError).shortMessage || buyError.message}
              </div>
            )}
          </div>
          {buyConfirmed && (
            <div className="flex flex-wrap items-center text-foreground-muted-dark font-semibold mt-1">
              <span className="">Manage listings in your</span>
              <Link
                href="/profile"
                className="flex items-center text-foreground ml-1 fill-none stroke-foreground hover:text-blue hover:stroke-blue"
              >
                <span>Profile</span>
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="mb-[0.5px]"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
      <div className="flex flex-col w-full rounded-radii-sm border border-white/[0.08] overflow-hidden mt-4">
        <div className="flex items-center p-5 border-b border-white/[0.12]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#fff"
            className="mr-2"
          >
            <path d="M480-560h200v-80H480v80Zm0 240h200v-80H480v80ZM360-520q33 0 56.5-23.5T440-600q0-33-23.5-56.5T360-680q-33 0-56.5 23.5T280-600q0 33 23.5 56.5T360-520Zm0 240q33 0 56.5-23.5T440-360q0-33-23.5-56.5T360-440q-33 0-56.5 23.5T280-360q0 33 23.5 56.5T360-280ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
          </svg>
          <h4 className="text-lg font-semibold text-foreground">Details</h4>
        </div>
        <div className="flex flex-col p-5 gap-2">
          <div className="flex justify-between">
            <span>Conract address</span>
            <Link
              href={`https://sepolia.basescan.org/address/${ADDRESS}`}
              target="_blank"
              className="text-blue-light hover:text-blue-hover text-end"
            >
              <span className="break-all">{shrinkAddress(ADDRESS)}</span>
            </Link>
          </div>
          <div className="flex justify-between">
            <span>Token ID</span>
            <Link
              href={`https://sepolia.basescan.org/address/${ADDRESS}/?a=${tokenId}`}
              target="_blank"
              className="text-blue-light hover:text-blue-hover text-end"
            >
              {tokenId.toString()}
            </Link>
          </div>
          <div className="flex justify-between">
            <span>Token Standard</span>
            <span className="text-end">ERC-721</span>
          </div>
          <div className="flex justify-between">
            <span>Chain</span>
            <span className="text-end">Base Sepolia</span>
          </div>
          <div className="flex justify-between">
            <span>Creator Earnings</span>
            <span className="text-end">
              {nftItem?.royaltyFeePercent.toString()}%
            </span>
          </div>
        </div>
      </div>
    </div>
    // <div className="pt-40">
    //   <h1 className="text-3xl font-semibold">NFT Item page</h1>
    //   {!isTokenIdValid ? (
    //     <div className="text-red-500">Invalid token</div>
    //   ) : nftItem ? (
    //     <div>
    //       {/* <NFTCard nft={nftItem} /> */}
    //       {nftItem.currentOwner === accountAddress ? (
    //         "You own this NFT!"
    //       ) : (
    //         <div>
    //           <button
    //             onClick={() => buyNFT(nftItem.tokenId, nftItem.price)}
    //             disabled={buyPending || buyConfirming || buyConfirmed}
    //             className={cn(
    //               `bg-slate-400`,
    //               `${buyPending && "bg-blue-300"}`,
    //               `${buyConfirming && "bg-gray-600"}`,
    //               `${buyConfirmed && "bg-green-400"}`
    //             )}
    //           >
    //             {buyPending
    //               ? "Tx pending..."
    //               : buyConfirming
    //                 ? "Confirming Tx ..."
    //                 : buyConfirmed
    //                   ? "Bought the NFT!!"
    //                   : "Buy this NFT"}
    //           </button>
    //           {buyHash && <div>Transaction Hash: {buyHash}</div>}
    //           {buyConfirming && <div>Waiting for confirmation...</div>}
    //           {buyConfirmed && <div>Transaction confirmed.</div>}
    //           {buyError && (
    //             <div>
    //               Error:{" "}
    //               {(buyError as BaseError).shortMessage || buyError.message}
    //             </div>
    //           )}
    //         </div>
    //       )}
    //     </div>
    //   ) : (
    //     <div>Loading NFT ...</div>
    //   )}
    // </div>
  )
}

export default NftItemPage
