import { getRequestContext } from "@cloudflare/next-on-pages"
import { v4 } from "uuid"
import { mapMediaParams, mediaParams } from "./param"

export const runtime = "edge"

export async function POST(request: Request) {
  const { env } = getRequestContext()

  const contentType = request.headers.get("content-type")
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return new Response("Unsupported content type", { status: 400 })
  }

  const boundary = contentType.split("boundary=")[1]
  const body = await request.text()

  const parts = body.split(`--${boundary}`).filter((part) => part.includes("Content-Disposition"))
  const path = v4()
  const images = await Promise.all(
    parts.map(async (part) => {
      const [headers, bodyContent] = part.split("\r\n\r\n")
      const mimeTypeMatch = headers.match(/Content-Type: (.+)/)
      const fileNameMatch = headers.match(/name="(.+?)"/)
      // console.log(headers)
      if (mimeTypeMatch && fileNameMatch) {
        const mimeType = mimeTypeMatch[1]
        const fileName = fileNameMatch[1]
        const byteString = atob(bodyContent.trim())
        const byteArray = Uint8Array.from(byteString, (char) => char.charCodeAt(0))
        const blob = new Blob([byteArray], { type: mimeType })
        const receivedSize = (blob.size / 1024).toFixed(2) + " KB"

        //console.log(mapMediaParams[fileName])
        //
        await env.BUCKET.put(`${path}/${mapMediaParams[fileName]}`, blob, {
          httpMetadata: {
            contentType: mimeType,
          },
        })

        return `${path}/${mapMediaParams[fileName]}`
      }
      return null
    })
  )

  return Response.json({ path })
}
