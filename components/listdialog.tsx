"use client"

import Link from "next/link"

import React from "react"

import { type BaseError } from "wagmi"

import { cn } from "@/lib/utils"

import { NFTMetadata } from "@/lib/types"

type ListDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement>
  listingPrice: string
  setListingPrice: (price: string) => void
  listNFT: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  listPending: boolean
  listConfirming: boolean
  listConfirmed: boolean
  listHash: string | undefined
  listError: any
  closeDialog: () => void
}

const ListDialog = ({
  dialogRef,
  listingPrice,
  setListingPrice,
  listNFT,
  listPending,
  listConfirming,
  listConfirmed,
  listHash,
  listError,
  closeDialog,
}: ListDialogProps) => {
  return (
    <dialog
      ref={dialogRef}
      className="z-50 bg-elevation rounded-radii-sm px-6 py-5 text-foreground font-sans"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-semibold">List for sale</h2>
        <p className="text-base text-foreground-muted-dark font-normal">
          This will list the NFT on the marketplace so other users can buy it.
        </p>
        <form className="flex flex-col mt-2" onSubmit={listNFT}>
          <div>
            <h3 className="text-base font-medium">Listing price</h3>
            <div className="flex mt-2 py-2 px-4 bg-white/5 text-base rounded-radii-full overflow-hidden hover:bg-white/10">
              <input
                autoComplete="off"
                className="w-full text-foreground bg-transparent px-1 py-0.5 active:border-white/10 focus:outline-none focus:border-none focus:bg-transparent placeholder:text-foreground-muted-dark placeholder:font-medium placehoder:text-sm"
                id="nftPrice"
                value={listingPrice}
                type="number"
                step="any"
                placeholder={`e.g. \"0.02\"`}
                onChange={(e) => setListingPrice(e.target.value)}
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
          <div className="flex flex-col text-sm font-medium text-foreground-muted-dark break-words">
            {listHash && (
              <div className="mt-4">Transaction Hash: {listHash}</div>
            )}
            {listConfirming && <div>Waiting for confirmation...</div>}
            {listConfirmed && (
              <div className="text-blue">Transaction confirmed.</div>
            )}
            {listError && (
              <div className="text-red-alt font-medium mt-4">
                Error:{" "}
                {(listError as BaseError).shortMessage || listError.message}
              </div>
            )}
          </div>
          {listConfirmed && (
            <div className="flex flex-wrap items-center text-foreground-muted-dark font-semibold mt-2">
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

          <div className="flex flex-wrap gap-2 justify-between w-full items-center mt-4">
            <button
              disabled={
                !listingPrice || listPending || listConfirming || listConfirmed
              }
              type="submit"
              className={cn(
                `bg-blue text-foreground hover:bg-blue-hover`,
                `${!listingPrice && "bg-blue/50 text-foreground/70 hover:bg-blue/50"}`,
                `${listPending && "bg-white/5 hover:bg-white/5"}`,
                `${listConfirming && "bg-white/5 hover:bg-white/5"}`,
                `${listConfirmed && "bg-white/5 hover:bg-white/5"}`,
                "px-6 py-[0.625rem] rounded-radii-full font-semibold text-base disabled:cursor-not-allowed"
              )}
            >
              {listPending
                ? "Listing..."
                : listConfirming
                  ? "Confirming..."
                  : listConfirmed
                    ? "Listing Confirmed!"
                    : "List"}
            </button>
            <button
              type="button"
              disabled={listPending || listConfirming}
              className="bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 px-6 py-[0.625rem] rounded-radii-full font-semibold text-base disabled:text-foreground/70 disabled:cursor-not-allowed"
              onClick={closeDialog}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default ListDialog
