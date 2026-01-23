import { useState, useEffect } from 'react'
import { ImageOff, Loader2, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface ImagePreviewProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string
  containerClassName?: string
  enablePreview?: boolean
}

export function ImagePreview({
  className,
  containerClassName,
  src,
  alt,
  fallbackText,
  enablePreview = true,
  ...props
}: ImagePreviewProps) {
  const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>(
    'loading',
  )
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!src) {
      setStatus('error')
    } else {
      setStatus('loading')
    }
  }, [src])

  const handleLoad = () => setStatus('loaded')
  const handleError = () => setStatus('error')

  const canPreview = enablePreview && status === 'loaded' && !!src

  const Thumbnail = (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800',
        canPreview ? 'cursor-zoom-in group' : '',
        containerClassName,
        className,
      )}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 z-10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-1 z-10">
          <ImageOff className="h-5 w-5 opacity-20" />
          {fallbackText && (
            <span className="text-[9px] mt-1 text-center truncate w-full">
              {fallbackText}
            </span>
          )}
        </div>
      )}

      {canPreview && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors duration-200 z-20 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100"></div>
      )}

      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'h-full w-full object-cover transition-all duration-300',
            status === 'loaded'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95',
            'bg-transparent',
          )}
          {...props}
        />
      )}
    </div>
  )

  if (!canPreview) {
    return Thumbnail
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{Thumbnail}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl w-full p-0 overflow-hidden bg-background border shadow-xl flex flex-col gap-0 duration-200">
        <DialogHeader className="p-4 border-b bg-card/50 backdrop-blur-sm z-30">
          <DialogTitle className="text-base font-medium truncate pr-8 flex items-center gap-2">
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
            {alt || 'Visualização de Imagem'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualização ampliada da imagem selecionada
          </DialogDescription>
        </DialogHeader>
        <div className="relative flex items-center justify-center p-6 bg-slate-100/50 dark:bg-black/50 min-h-[300px] max-h-[80vh] overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded shadow-sm animate-fade-in"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
