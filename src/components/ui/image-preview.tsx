import { useState, useEffect } from 'react'
import { ImageOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePreviewProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string
  containerClassName?: string
}

export function ImagePreview({
  className,
  containerClassName,
  src,
  alt,
  fallbackText,
  ...props
}: ImagePreviewProps) {
  const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>(
    'loading',
  )

  useEffect(() => {
    if (!src) {
      setStatus('error')
    } else {
      setStatus('loading')
    }
  }, [src])

  const handleLoad = () => setStatus('loaded')
  const handleError = () => setStatus('error')

  if (!src || src === '') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-muted-foreground rounded-md overflow-hidden',
          containerClassName,
          className,
        )}
      >
        <ImageOff className="h-5 w-5 opacity-20" />
        {fallbackText && (
          <span className="text-[9px] mt-1 text-center px-1 truncate w-full">
            {fallbackText}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800',
        containerClassName,
        className,
      )}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-1">
          <ImageOff className="h-5 w-5 opacity-20" />
          {fallbackText && (
            <span className="text-[9px] mt-1 text-center truncate w-full">
              {fallbackText}
            </span>
          )}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'h-full w-full object-cover transition-all duration-300',
          status === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          'bg-transparent',
        )}
        {...props}
      />
    </div>
  )
}
