import { useState } from 'react'
import { shareUrl } from '../utils/share'

interface ShareButtonProps {
  url: string
}

export const ShareButton = ({ url }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    await shareUrl(url)
    if (!navigator.share) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={onShare}
      className='rounded-full border border-white/10 bg-ocean-700 px-4 py-2 text-xs uppercase tracking-wide text-white'
      type='button'
    >
      {copied ? 'Copiado' : 'Compartir'}
    </button>
  )
}
