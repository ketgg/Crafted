"server only"

import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PinataSDK } from "pinata-web3"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
})

export const capitalizeFLetter = (text: string) => {
  return text[0].toUpperCase() + text.slice(1)
}
