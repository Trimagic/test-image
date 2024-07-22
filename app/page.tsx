"use client"

import React, { useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoaderIcon } from "lucide-react"
import FormData from "form-data"

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [receivedImages, setReceivedImages] = useState<
    { src: string; info: { format: string; size: string } }[]
  >([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile)
        setImageSrc(URL.createObjectURL(selectedFile))
        setReceivedImages([])
        setError(null)
      } else {
        setError("Пожалуйста, выберите файл изображения")
        setFile(null)
        setImageSrc(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Пожалуйста, выберите файл")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    const params = {
      params: [
        { format: "webp", width: 1067, height: 600, quality: 60 },
        { format: "webp", width: 533, height: 300, quality: 30 },
        { format: "webp", width: 356, height: 200, quality: 20 },
        { format: "webp", width: 178, height: 100, quality: 10 },
        { format: "png", width: 533, height: 300, quality: 60 },
      ],
    }

    formData.append("params", new Blob([JSON.stringify(params)], { type: "application/json" }))

    try {
      const response = await axios.post(
        "https://image-converter-one.vercel.app/api/handler",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )

      if (response.status === 200) {
        const contentType = response.headers["content-type"]
        const boundary = contentType.split("boundary=")[1]

        const parts = response.data
          .split(`--${boundary}`)
          .filter((part) => part.includes("Content-Disposition"))

        const images = parts
          .map((part) => {
            const [headers, body] = part.split("\r\n\r\n")
            const mimeTypeMatch = headers.match(/Content-Type: (.+)/)

            if (mimeTypeMatch) {
              const mimeType = mimeTypeMatch[1]
              const byteString = atob(body.trim())
              const byteArray = Uint8Array.from(byteString, (char) => char.charCodeAt(0))
              const blob = new Blob([byteArray], { type: mimeType })
              const receivedUrl = URL.createObjectURL(blob)
              const receivedFormat = mimeType.split("/")[1].toUpperCase()
              const receivedSize = (blob.size / 1024).toFixed(2) + " KB"

              return { blob, info: { format: receivedFormat, size: receivedSize } }
            }
            return null
          })
          .filter(Boolean) as { blob: Blob; info: { format: string; size: string } }[]

        // Create an array of fetch promises
        const uploadPromises = images.map((image) => {
          const uploadData = new FormData()
          uploadData.append("file", image.blob, `image.${image.info.format.toLowerCase()}`)

          // Determine size category
          const sizeInKB = parseFloat(image.info.size)
          let sizeCategory
          if (sizeInKB <= 5) {
            sizeCategory = "low"
          } else if (sizeInKB <= 10) {
            sizeCategory = "low-mid"
          } else if (sizeInKB <= 30) {
            sizeCategory = "middle"
          } else if (sizeInKB <= 60) {
            sizeCategory = "high"
          } else {
            sizeCategory = "none"
          }

          // Construct query parameters
          const queryParams = new URLSearchParams({
            type: image.info.format.toLowerCase(),
            size: sizeCategory,
            id_media: Math.random().toString(16),
          })

          return fetch(`/api/media?${queryParams.toString()}`, {
            method: "POST",
            body: uploadData,
          })
        })

        // Wait for all uploads to finish
        await Promise.all(uploadPromises)

        setReceivedImages(
          images.map((image) => {
            const receivedUrl = URL.createObjectURL(image.blob)
            return { src: receivedUrl, info: image.info }
          })
        )
      } else {
        setError("Сервер вернул ошибку")
      }
    } catch (err) {
      setError("Ошибка при загрузке файла")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col p-4">
      <Input
        type="file"
        className="h-14 text-3xl text-center font-semibold"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Button
        onClick={handleUpload}
        className="h-16 text-3xl text-neutral-700 mt-5"
        disabled={loading}
      >
        {loading ? <LoaderIcon className="animate-spin h-10 w-10 mr-3" /> : "Компрессовать"}
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-center">Загруженное</h2>
          {imageSrc && (
            <div>
              <img className="w-full h-auto rounded-md" src={imageSrc} alt="Uploaded File" />
            </div>
          )}
        </div>
        {receivedImages.map((img, index) => (
          <div key={index} className="flex-1">
            <h2 className="text-lg font-bold text-center">Компрессия {index + 1}</h2>
            <p className="text-center">
              Формат: {img.info.format}, Размер: {img.info.size}
            </p>
            <img
              className="w-full h-auto rounded-md"
              src={img.src}
              alt={`Received File ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileUpload