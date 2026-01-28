import {
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle,
  DownloadCloud,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useInventoryStore from '@/stores/useInventoryStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function ConnectionStatus() {
  const {
    syncStatus,
    lastSync,
    isOnline,
    simulateRemoteUpdate,
    currentUser,
    retryConnection,
  } = useInventoryStore()
  const canSimulate =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'offline':
        return <CloudOff className="h-4 w-4 text-muted-foreground" />
      case 'synced':
      default:
        return <Cloud className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusLabel = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Salvando...'
      case 'error':
        return 'Erro de Sincronização'
      case 'offline':
        return 'Modo Offline'
      case 'synced':
      default:
        return 'Sincronizado'
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 md:w-auto md:px-2 md:gap-2"
        >
          {getStatusIcon()}
          <span className="hidden md:inline-block text-xs font-medium">
            {getStatusLabel()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm">Status da Conexão</h4>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] uppercase',
                isOnline
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
              )}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Última sincronização:</span>
              <span className="font-medium text-foreground">
                {format(new Date(lastSync), 'HH:mm:ss', { locale: ptBR })}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Status atual:</span>
              <span className="font-medium text-foreground">
                {getStatusLabel()}
              </span>
            </div>
            {syncStatus === 'error' && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={retryConnection}
              >
                <RefreshCw className="mr-2 h-3 w-3" /> Tentar Conectar
              </Button>
            )}
          </div>

          {canSimulate && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => simulateRemoteUpdate()}
                disabled={!isOnline || syncStatus === 'syncing'}
              >
                <DownloadCloud className="mr-2 h-3 w-3" />
                Simular Atualização Remota
              </Button>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Use este botão para simular uma alteração feita por outro
                usuário em outro dispositivo (Demo).
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
