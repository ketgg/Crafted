import React from "react"
import NftCard from "@/components/nftcard"
import { MarketItem, NFTMetadata } from "@/lib/types"

type GalleryProps = {
  itemsList: MarketItem[]
  openListDialog?: (tokenId: bigint) => void
  openUnlistDialog?: (tokenId: bigint) => void
}

const Gallery = ({
  itemsList,
  openListDialog,
  openUnlistDialog,
}: GalleryProps) => {
  return (
    <div className="grid grid-cols-1 scr-20:grid-cols-2 scr-30:grid-cols-3 scr-50:grid-cols-4 scr-60:grid-cols-5 lg:grid-cols-3 scr-70:grid-cols-4 scr-90:grid-cols-5 gap-2 sm:gap-4 [&>div:not(:first-child)]:mt-2 md:[&>div:not(:first-child)]:mt-4">
      {itemsList.map((item, index) => {
        return (
          <NftCard
            openListDialog={openListDialog}
            openUnlistDialog={openUnlistDialog}
            key={index}
            nft={item}
          />
        )
      })}
    </div>
  )
}

export default Gallery
