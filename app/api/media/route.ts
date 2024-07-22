import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function POST(request: Request) {
  const { env } = getRequestContext()

  // Получение параметров id_media, size и format из строки запроса
  const url = new URL(request.url)
  const idMedia = url.searchParams.get("id_media")
  const sizeParam = url.searchParams.get("size")
  const formatParam = url.searchParams.get("format")

  if (!idMedia || !sizeParam || !formatParam) {
    console.error("Missing parameters:", { idMedia, sizeParam, formatParam })
    return new Response(JSON.stringify({ error: "Missing id_media, size, or format parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Получение тела запроса
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    console.error("No file uploaded")
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Чтение файла как ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()
  const byteArray = new Uint8Array(arrayBuffer)

  // Получение типа файла (формата)
  const mimeType = file.type

  // Вычисление размера файла в КБ
  const fileSize = (byteArray.length / 1024).toFixed(2) + " KB"

  // Загрузка файла в R2
  const filePath = `${idMedia}/${formatParam}/${sizeParam}`

  try {
    console.log("Uploading to R2:", { filePath, mimeType, fileSize })
    await env.BUCKET.put(filePath, byteArray, {
      httpMetadata: {
        contentType: mimeType,
      },
    })
    console.log("Upload to R2 successful")
  } catch (error) {
    console.error("Error uploading to R2:", error)
    return new Response(JSON.stringify({ error: "Error uploading to R2" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Ответ с информацией о формате и размере файла и переданных параметрах
  const response = {
    id_media: idMedia,
    requested_size: sizeParam,
    requested_format: formatParam,
    actual_format: mimeType.split("/")[1].toUpperCase(),
    actual_size: fileSize,
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
