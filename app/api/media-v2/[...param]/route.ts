import { getRequestContext } from "@cloudflare/next-on-pages"

export async function GET(request: Request, param: any) {
  const { env } = getRequestContext()

  return Response.json(env)
}
