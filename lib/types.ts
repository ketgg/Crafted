type MarketItem = {
  tokenId: bigint
  creator: `0x${string}`
  currentOwner: `0x${string}`
  price: bigint
  royaltyFeePercent: number
  isListed: boolean
}

type Address = `0x${string}`

type NFTMetadata = {
  name: string
  description: string
  fileUrl: string
}

export type { MarketItem, Address, NFTMetadata }
