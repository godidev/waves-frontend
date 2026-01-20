/**
 * Comparte una URL usando la API de compartir del navegador o la copia al portapapeles como alternativa
 */
export const shareUrl = async (url: string) => {
  if (navigator.share) {
    await navigator.share({ url })
    return
  }
  await navigator.clipboard.writeText(url)
}
