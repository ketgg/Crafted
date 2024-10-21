"use client"

import Image from "next/image"
import Link from "next/link"

import React, { useState, useRef, useEffect } from "react"

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { type BaseError } from "wagmi"

import { parseEther } from "viem"

import WalletWrapper from "@/components/wallet"
import { Skeleton } from "@/components/skeleton"

import { pinFileToIPFS, pinJSONToIPFS } from "@/actions/pinata"

import { ABI, ADDRESS } from "@/contract"

import { cn } from "@/lib/utils"
import { div, section } from "framer-motion/client"
import Switcher from "@/components/switcher"

const Mint = () => {
  const [inputParams, updateInputParams] = useState({
    name: "",
    description: "",
    price: "",
    royalty: "",
  })
  const [fileHash, setFileHash] = useState<string>("")
  const [fileUrl, setFileUrl] = useState<string>("")
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadingJSON, setUploadingJSON] = useState<boolean>(false)
  const [listed, setIsListed] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!listed) {
      updateInputParams((prevParams) => ({
        ...prevParams,
        price: "0", // Set price to "0" when listed is false
      }))
    } else {
      updateInputParams((prevParams) => ({
        ...prevParams,
        price: "", // Set price to "0" when listed is false
      }))
    }
  }, [listed])

  const { address: accountAddress, status: accountStatus } = useAccount()

  // READ - Get the current market fee
  const { data: mintingFee } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    functionName: "mintingFee",
  })

  // WRITE - Mint NFT
  const {
    data: mintHash,
    error: mintError,
    isPending: mintPending,
    writeContractAsync: mintWriteContractAsync,
  } = useWriteContract()
  const { isLoading: mintConfirming, isSuccess: mintConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash })

  // FUNCTION - Mint NFT
  const mint = async () => {
    if (uploading) {
      alert("File uploading!")
      return
    }
    try {
      const { name, description, price, royalty } = inputParams

      // Make sure that none of the fields are empty
      if (!name || !description || !price || !royalty || !fileHash) {
        console.log("Missing fields!")
        return
      }

      setUploadingJSON(true)

      const pinnedJSON = await pinJSONToIPFS({
        fileIpfsHash: fileHash,
        name: name,
        description: description,
      })
      if (pinnedJSON === undefined) throw new Error("Empty pinnedJSON")

      if (pinnedJSON.success === true) {
        setUploadingJSON(false)

        const { jsonIpfsHash: ipfsHash } = pinnedJSON

        if (!ipfsHash) throw new Error("Missing ipfsHash of the File!")

        const priceInWei = parseEther(price)
        const fee = mintingFee

        const mintTx = await mintWriteContractAsync({
          abi: ABI,
          address: ADDRESS,
          functionName: "mintNFT",
          args: [ipfsHash, priceInWei, listed, Number(royalty)],
          value: fee,
        })
        if (mintTx && !mintPending) {
          console.log("mintTx Success")
          return
        }
      } else {
        throw new Error("Success message from pinJSONToIPFS is NOT true!")
      }
    } catch (e) {
      setUploadingJSON(false)
      console.log("Error while minting: ", e)
    }
  }

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleOnChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0]

    try {
      // Upload the file to IPFS
      setUploading(true)
      if (file) {
        const pinnedFile = await pinFileToIPFS({ file })
        if (pinnedFile === undefined) throw new Error("Empty pinnedFile")
        if (pinnedFile.success === true) {
          pinnedFile.fileIpfsHash && setFileHash(pinnedFile.fileIpfsHash)
          pinnedFile.fileUrl && setFileUrl(pinnedFile.fileUrl)
        }
      }
      setUploading(false)
    } catch (e) {
      console.log("Error during file upload", e)
    }
  }

  if (accountStatus === "disconnected") {
    return (
      <div className="w-full flex flex-col gap-4 items-center justify-center pt-60 px-10 font-sans">
        <h1 className="text-base text-foreground-muted text-center">
          {`Please connect your wallet to create NFT :)`}
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
    <section className="relative flex flex-col w-full mx-auto px-4 py-32 scr-1360:max-w-[1360px] scr-1360:mx-auto scr-1360:px-4 scr-1560:px-4 font-sans">
      <div className="flex flex-col md:flex-row md:gap-[2vw]">
        <div className="flex flex-col gap-1 w-full h-full md:max-w-[37.rem] justify-center items-center">
          <h1 className="text-4xl font-medium">Mint NFT</h1>
          <p className="font-normal text-foreground-muted">
            Once your item is minted you will not be able to change any of its
            information.
          </p>
        </div>
        {/* <div className="flex flex-col w-full h-full md:max-w-[37.rem]"></div> */}
      </div>
      <div className="flex flex-col md:flex-row mt-8 md:gap-[2vw] px-4">
        <div className="flex flex-col items-center w-full h-full md:max-w-[37.rem]">
          <div
            onClick={handleClick}
            className={`relative flex flex-col items-center justify-center w-full h-full aspect-square max-w-[280px] min-h-[280px] sm:max-w-[400px] sm:min-h-[400px] md:max-w-[600px] md:max-h-[600px] border ${fileUrl ? "border-none" : uploading ? "border-solid" : "border-dashed"} hover:${fileUrl ? "border-none" : "border-solid"} hover:bg-white/[0.04] border-white/30 rounded-radii-lg overflow-hidden ${
              uploading ||
              uploadingJSON ||
              mintPending ||
              mintConfirming ||
              mintConfirmed
                ? ""
                : "cursor-pointer"
            }`}
          >
            <input
              ref={fileInputRef}
              disabled={
                uploading ||
                uploadingJSON ||
                mintPending ||
                mintConfirming ||
                mintConfirmed
              }
              type="file"
              accept="image/png, image/jpg, image/jpeg, image/webp, image/gif, audio/mp3"
              onChange={handleOnChangeFile}
              className="hidden"
            />
            {uploading ? (
              <Skeleton className="w-full h-full" />
            ) : fileUrl ? (
              <Image
                src={fileUrl}
                alt={`Uploaded file`}
                fill={true}
                sizes="600px"
                className="object-cover object-center"
              />
            ) : (
              <>
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    id="upload"
                    className="w-10 h-10"
                  >
                    <path
                      fill="none"
                      stroke="#fff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 22.05V11A4 4 0 0 1 7 7H25a4 4 0 0 1 4 4V22.05M26 28.9s-10.67 2.27-9.6-14.76"
                    ></path>
                    <line
                      x1="11.07"
                      x2="16.4"
                      y1="20.95"
                      y2="13"
                      fill="none"
                      stroke="#fff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></line>
                    <line
                      x1="21.73"
                      x2="16.4"
                      y1="20.95"
                      y2="13"
                      fill="none"
                      stroke="#fff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></line>
                  </svg>
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-medium">Drag and drop media</span>
                    <span className="text-sm text-blue font-medium">
                      Browse files
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center font-medium text-foreground-muted-dark text-sm">
                  <span>Image/Gif</span>
                  <span>PNG, JPG, WEBP, GIF</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4 md:mt-0 w-full h-full md:max-w-[37.rem]">
          <div>
            <h3 className="text-xl font-medium">Name</h3>
            <div className="mt-2 py-2 px-4 bg-white/5 text-base rounded-radii-full overflow-hidden hover:bg-white/10">
              <input
                autoComplete="off"
                className="w-full text-foreground bg-transparent p-1 active:border-white/10 focus:outline-none focus:border-none focus:bg-transparent placeholder:text-foreground-muted-dark placeholder:font-medium placehoder:text-sm"
                id="nftName"
                type="text"
                placeholder={`e.g. \"Ethereal Visions\"`}
                onChange={(e) =>
                  updateInputParams({ ...inputParams, name: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium">Description</h3>
            <div className="mt-2 py-2 px-4 bg-white/5 text-base rounded-radii-full overflow-hidden hover:bg-white/10">
              <input
                autoComplete="off"
                className="w-full text-foreground bg-transparent p-1 active:border-white/10 focus:outline-none focus:border-none focus:bg-transparent placeholder:text-foreground-muted-dark placeholder:font-medium placehoder:text-sm"
                id="nftDescription"
                type="text"
                placeholder={`e.g. \"A journey through blending art and technology\"`}
                onChange={(e) =>
                  updateInputParams({
                    ...inputParams,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-medium mr-4">Put on marketplace</h3>
              <div className="text-foreground-muted-dark font-medium text-sm">
                {listed
                  ? "Enter price to allow users instantly purchase your NFT"
                  : "List your new NFT for sale"}
              </div>
            </div>

            <Switcher isChecked={listed} setIsChecked={setIsListed} />
          </div>
          {listed && (
            <div>
              <h3 className="text-xl font-medium">Price</h3>
              <div className="flex mt-2 py-2 px-4 bg-white/5 text-base rounded-radii-full overflow-hidden hover:bg-white/10">
                <input
                  autoComplete="off"
                  className="w-full text-foreground bg-transparent p-1 active:border-white/10 focus:outline-none focus:border-none focus:bg-transparent placeholder:text-foreground-muted-dark placeholder:font-medium placehoder:text-sm"
                  id="nftPrice"
                  type="number"
                  step="any"
                  placeholder={`e.g. \"0.02\"`}
                  onChange={(e) =>
                    updateInputParams({
                      ...inputParams,
                      price: e.target.value,
                    })
                  }
                />
                <div className="grow-0 shrink-0 flex items-center justify-center">
                  <span className="text-foreground-muted ml-2">ETH</span>
                  <span className="ml-1">
                    <svg
                      className="fill-foreground-muted-dark"
                      width="16px"
                      height="16px"
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
          )}

          <div>
            <h3 className="text-xl font-medium">Royalties</h3>
            <div className="flex mt-2 py-2 px-4 bg-white/5 text-base rounded-radii-full overflow-hidden hover:bg-white/10">
              <input
                autoComplete="off"
                className="w-full text-foreground bg-transparent p-1 active:border-white/10 focus:outline-none focus:border-none focus:bg-transparent placeholder:text-foreground-muted-dark placeholder:font-medium placehoder:text-sm"
                id="nftRoyalty"
                type="number"
                step="any"
                placeholder={`e.g. \"20\"`}
                onChange={(e) =>
                  updateInputParams({
                    ...inputParams,
                    royalty: e.target.value,
                  })
                }
              />
              <div className="grow-0 shrink-0 flex items-center justify-center">
                <span className="text-foreground-muted ml-2">%</span>
              </div>
            </div>
            <p className="mt-1 text-foreground-muted-dark font-medium text-sm">
              Suggested: 0%, 5%, 10%, 20%. Maximum is 25%
            </p>
          </div>
          <div className="flex w-full items-center mt-2">
            <button
              disabled={
                !inputParams.name ||
                !inputParams.description ||
                !inputParams.price ||
                !inputParams.royalty ||
                !fileHash ||
                uploadingJSON ||
                mintPending ||
                mintConfirming ||
                mintConfirmed
              }
              type="submit"
              className={cn(
                `bg-blue text-foreground hover:bg-blue-hover`,
                `${(!inputParams.name || !inputParams.description || !inputParams.price || !inputParams.royalty || !fileHash) && "bg-blue/50 text-foreground/70 hover:bg-blue/50"}`,
                `${(uploadingJSON || mintPending) && "bg-white/5 hover:bg-white/5"}`,
                `${mintConfirming && "bg-white/5 hover:bg-white/5"}`,
                `${mintConfirmed && "bg-white/5 hover:bg-white/5"}`,
                "px-5 py-3 rounded-radii-full font-semibold text-base"
              )}
              onClick={mint}
            >
              {uploadingJSON
                ? "Uploading..."
                : mintPending
                  ? "Minting..."
                  : mintConfirming
                    ? "Confirming..."
                    : mintConfirmed
                      ? "Minting Confirmed!"
                      : "Create"}
            </button>
          </div>
          <div className="flex flex-col text-sm font-medium text-foreground-muted-dark break-words">
            {mintHash && <div>Transaction Hash: {mintHash}</div>}
            {mintConfirming && <div>Waiting for confirmation...</div>}
            {mintConfirmed && (
              <div className="text-blue">Transaction confirmed.</div>
            )}
            {mintError && (
              <div className="text-red-alt font-medium">
                Error:{" "}
                {(mintError as BaseError).shortMessage || mintError.message}
              </div>
            )}
          </div>
          {mintConfirmed && (
            <div className="flex items-center text-foreground-muted-dark font-semibold">
              <span className="">Manage listings in your </span>
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
          )}
        </div>
      </div>
    </section>
  )
}

export default Mint
