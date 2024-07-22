"use client"

import React, { useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoaderIcon } from "lucide-react"
import FormData from "form-data"
import { mediaParams } from "./api/media-v2/param"
import { ImageR2 } from "./image"

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [receivedImages, setReceivedImages] = useState<
    { src: string; info: { format: string; size: string } }[]
  >([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [paths, setPath] = useState<{ path: string; size: string }[]>([])

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

    // const params = {
    //   params: [
    //     { format: "webp", width: 1067, height: 600, quality: 60 },
    //     { format: "webp", width: 533, height: 300, quality: 30 },
    //     { format: "webp", width: 356, height: 200, quality: 20 },
    //     { format: "webp", width: 178, height: 100, quality: 10 },
    //     { format: "png", width: 533, height: 300, quality: 60 },
    //   ],
    // }

    formData.append("params", new Blob([JSON.stringify(mediaParams)], { type: "application/json" }))

    try {
      const initial = await axios.post(
        "https://image-converter-one.vercel.app/api/handler",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      const forward = await axios.post("/api/media-v2", initial.data, {
        headers: {
          "Content-Type": initial.headers["content-type"],
        },
      })

      setPath(
        Object.values(mediaParams.params).map(({ type }) => ({
          path: forward.data.path,
          size: type,
        }))
      )
      console.log(forward.data.path)
    } catch (err) {
      console.log(err)
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
        {paths.map(({ path, size }, index) => (
          <div key={index} className="flex-1">
            <h2 className="text-lg font-bold text-center">Компрессия {index + 1}</h2>
            {/* <p className="text-center">
              Формат: {img.info.format}, Размер: {img.info.size}
            </p> */}
            <ImageR2
              className="w-full h-auto rounded-md"
              src={path}
              size={size as any}
              // alt={`Received File ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileUpload
