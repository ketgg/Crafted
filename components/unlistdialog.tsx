"use client"

import Link from "next/link"
import React from "react"

import { type BaseError } from "wagmi"

import { cn } from "@/lib/utils"

import { NFTMetadata } from "@/lib/types"

type UnlistDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement>
  unlistNFT: () => Promise<void>
  unlistPending: boolean
  unlistConfirming: boolean
  unlistConfirmed: boolean
  unlistHash: string | undefined
  unlistError: any
  closeDialog: () => void
}

const UnlistDialog = ({
  dialogRef,
  unlistNFT,
  unlistPending,
  unlistConfirming,
  unlistConfirmed,
  unlistHash,
  unlistError,
  closeDialog,
}: UnlistDialogProps) => {
  return (
    <dialog
      ref={dialogRef}
      className="z-50 bg-elevation rounded-radii-sm px-6 py-5 text-foreground font-sans"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-semibold">Unlist from sale</h2>
        <p className="text-base text-foreground-muted-dark font-medium tracking-tight">
          This will unlist the NFT from the marketplace and other users will not
          be able to buy it.
        </p>
      </div>

      <div className="flex flex-col text-sm font-medium text-foreground-muted-dark break-words">
        {unlistHash && (
          <div className="mt-3">Transaction Hash: {unlistHash}</div>
        )}
        {unlistConfirming && <div>Waiting for confirmation...</div>}
        {unlistConfirmed && (
          <div className="text-blue">Transaction confirmed.</div>
        )}
        {unlistError && (
          <div className="text-red-alt font-medium">
            Error:{" "}
            {(unlistError as BaseError).shortMessage || unlistError.message}
          </div>
        )}
      </div>
      {unlistConfirmed && (
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

      <div className="flex flex-wrap gap-2 justify-between w-full items-center mt-3">
        <button
          onClick={unlistNFT}
          disabled={unlistPending || unlistConfirming || unlistConfirmed}
          className={cn(
            `bg-blue text-foreground hover:bg-blue-hover`,
            `${unlistPending && "bg-white/5 hover:bg-white/5"}`,
            `${unlistConfirming && "bg-white/5 hover:bg-white/5"}`,
            `${unlistConfirmed && "bg-white/5 hover:bg-white/5"}`,
            "px-6 py-[0.625rem] rounded-radii-full font-semibold text-base disabled:cursor-not-allowed"
          )}
        >
          {unlistPending
            ? "Unlisting..."
            : unlistConfirming
              ? "Confirming..."
              : unlistConfirmed
                ? "Unlisting Confirmed!"
                : "Unlist"}
        </button>
        <button
          type="button"
          disabled={unlistPending || unlistConfirming}
          className="bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 px-6 py-[0.625rem] rounded-radii-full font-semibold text-base disabled:text-foreground/70 disabled:cursor-not-allowed"
          onClick={closeDialog}
        >
          Close
        </button>
      </div>
    </dialog>
  )
}

export default UnlistDialog
