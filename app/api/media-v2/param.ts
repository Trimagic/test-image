type TypeMediaSize = "high" | "mid" | "low" | "small" | "png"

export const mediaParams: {
  params: Array<{
    format: string
    width: number
    height: number
    quality: number
    type: TypeMediaSize
  }>
} = {
  params: [
    { format: "webp", width: 1067, height: 600, quality: 60, type: "high" },
    { format: "webp", width: 533, height: 300, quality: 30, type: "mid" },
    { format: "webp", width: 356, height: 200, quality: 20, type: "low" },
    { format: "webp", width: 178, height: 100, quality: 10, type: "small" },
    { format: "png", width: 533, height: 300, quality: 60, type: "png" },
  ],
}

const v = mediaParams.params

export const mapMediaParams = v.reduce((acc: Record<string, TypeMediaSize>, f) => {
  acc[`file_${f.format}_${f.width}x${f.height}_q${f.quality}.${f.format}`] = f.type
  return acc
}, {})
