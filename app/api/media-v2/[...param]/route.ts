export const runtime = "edge"

import { getRequestContext } from "@cloudflare/next-on-pages"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { param: [string, string] }
  }
) {
  const [id, type] = params.param
  const { env } = getRequestContext()

  try {
    const data = await env.BUCKET.get(`${id}/${type}`)
    if (!data) {
      return new Response("Not Found", { status: 404 })
    }

    // Assuming `data` has a `metadata` property that includes the format
    const format = data.httpMetadata?.contentType || "webp" // Default to jpeg if format is not found

    console.log(format)
    return new Response(data.body, {
      headers: {
        "Content-Type": format,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    })
  } catch (error) {
    console.error("Error fetching data:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
