export const runtime = "edge"

import { getRequestContext } from "@cloudflare/next-on-pages"

export async function GET(request: Request) {
  const { env } = getRequestContext()
  const list = await env.BUCKET.list()
  await Promise.all(
    list.objects.map(async ({ key }) => {
      await env.BUCKET.delete(key)
    })
  )

  return Response.json({})
}
