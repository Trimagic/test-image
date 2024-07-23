import { useEffect, useState } from "react"
import axios from "axios"

interface ImageR2Type {
  src: string
  className: string
  size: string // Assuming `TypeMediaSize` is a string for simplicity
}

export const ImageR2 = ({ className, size, src }: ImageR2Type) => {
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`/api/media-v2/${src}/${size}`, {
          responseType: "blob",
        })
        const imageBlob = response.data
        const imageObjectURL = URL.createObjectURL(imageBlob)
        setImageUrl(imageObjectURL)
      } catch (error) {
        console.error("Error fetching image:", error)
      }
    }

    fetchImage()
  }, [src, size])

  if (!imageUrl) return null // Optionally, render a loader or placeholder

  return <img src={imageUrl} className={className} alt="" />
}
