const WEBP_EXTENSION_LENGTH = 5
const MOBILE_IMAGE_WIDTH = 640
const TABLET_IMAGE_WIDTH = 960

const variantUrl = (imageUrl: string, width: number) =>
  imageUrl.endsWith(".webp")
    ? `${imageUrl.slice(0, -WEBP_EXTENSION_LENGTH)}-${width}w.webp`
    : imageUrl

/** Creates responsive source candidates for the generated room photos. */
export const roomImageSrcSet = (imageUrl: string) =>
  `${variantUrl(imageUrl, MOBILE_IMAGE_WIDTH)} ${MOBILE_IMAGE_WIDTH}w, ${variantUrl(imageUrl, TABLET_IMAGE_WIDTH)} ${TABLET_IMAGE_WIDTH}w, ${imageUrl} 1280w`

/** Chooses an appropriate room-photo variant for non-image-element preloads. */
export const roomImagePreloadUrl = (imageUrl: string) => {
  const renderedWidth = window.innerWidth * window.devicePixelRatio

  if (renderedWidth <= MOBILE_IMAGE_WIDTH) return variantUrl(imageUrl, MOBILE_IMAGE_WIDTH)
  if (renderedWidth <= TABLET_IMAGE_WIDTH) return variantUrl(imageUrl, TABLET_IMAGE_WIDTH)

  return imageUrl
}
