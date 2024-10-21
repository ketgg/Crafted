"use client"

import { pinata, capitalizeFLetter } from "@/lib/utils"

type pinFileToIPFSProps = {
  file: File
}

const pinFileToIPFS = async ({ file }: pinFileToIPFSProps) => {
  try {
    if (!file) {
      console.log("No file selected!")
      return
    }
    // Temporary API Key for client side
    const keyRequest = await fetch("/api/key")
    const keyData = await keyRequest.json()

    const uploadFile = await pinata.upload.file(file).key(keyData.JWT)
    // console.log(uploadFile)

    const fileUrl = await pinata.gateways.convert(uploadFile.IpfsHash)

    return {
      success: true,
      fileIpfsHash: uploadFile.IpfsHash,
      fileUrl: fileUrl,
    }
  } catch (error) {
    console.log("Some error uploading the file: ", error)
    return {
      success: false,
      message: error,
    }
  }
}

type pinJSONToIPFSProps = {
  fileIpfsHash: string
  name: string
  description: string
}

const pinJSONToIPFS = async ({
  fileIpfsHash,
  name,
  description,
}: pinJSONToIPFSProps) => {
  try {
    const keyRequest = await fetch("/api/key")
    const keyData = await keyRequest.json()
    const data = {
      name: capitalizeFLetter(name),
      description: capitalizeFLetter(description),
      image: `ipfs://${fileIpfsHash}`,
      external_url: "https://crafted.ketto.space",
    }

    const uploadJSON = await pinata.upload
      .json(data)
      .addMetadata({ name: `${name}.json` })
      .key(keyData.JWT)
    // console.log(uploadJSON)

    const jsonUrl = await pinata.gateways.convert(uploadJSON.IpfsHash)

    return {
      success: true,
      jsonIpfsHash: uploadJSON.IpfsHash,
      jsonUrl: jsonUrl,
    }
  } catch (error) {
    console.log("Some error pinning the JSON: ", error)
    return {
      success: false,
      message: error,
    }
  }
}

export { pinFileToIPFS, pinJSONToIPFS }
