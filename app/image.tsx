import { TypeMediaSize } from "./api/media-v2/param"

interface ImageR2Type {
  src: string
  className: string
  size: TypeMediaSize
}

export const ImageR2 = ({ className, size, src }: ImageR2Type) => {
  const path = `https://pub-fb93debbc9ff40c882f71aa27e066152.r2.dev/${src}/${size}`
  return <img src={path} className={className} alt="" />
}
