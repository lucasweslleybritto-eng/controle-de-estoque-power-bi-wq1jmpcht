import { Outlet, useLocation, Link } from 'react-router-dom'
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from './ThemeToggle'
import useInventoryStore from '@/stores/useInventoryStore'
import Login from '@/pages/Login'
import { UserNav } from './UserNav'
import { Notifications } from './Notifications'
import { ConnectionStatus } from './ConnectionStatus'

export default function Layout() {
  const { currentUser } = useInventoryStore()
  const location = useLocation()

  if (!currentUser) {
    return <Login />
  }

  const pathSegments = location.pathname.split('/').filter(Boolean)

  const getBreadcrumbName = (segment: string) => {
    const decoded = decodeURIComponent(segment)
    if (decoded === 'spreadsheet') return 'Planilha Geral'
    if (decoded === 'equipment') return 'Equipamentos'
    if (decoded === 'how-it-works') return 'Como Funciona'
    if (decoded === 'street') return 'Rua'
    if (decoded === 'location') return 'Localização'
    if (decoded === 'movements') return 'Entrada/Saída'
    if (decoded === 'history') return 'Histórico'
    if (decoded === 'settings') return 'Configurações'
    if (decoded === 'users') return 'Usuários'
    if (decoded === 'reports') return 'Relatórios'
    return decoded.charAt(0).toUpperCase() + decoded.slice(1)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 h-10 w-10" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Depósito</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments.length > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
                {pathSegments.map((segment, index) => {
                  const isLast = index === pathSegments.length - 1
                  const path = `/${pathSegments.slice(0, index + 1).join('/')}`
                  const name = getBreadcrumbName(segment)

                  return (
                    <BreadcrumbItem key={path}>
                      {isLast ? (
                        <BreadcrumbPage>{name}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink asChild>
                            <Link to={path}>{name}</Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mr-4 flex items-center gap-2">
            <ConnectionStatus />
            <Notifications />
            <ThemeToggle />
            <UserNav />
          </div>
        </header>
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-[100vw] overflow-x-hidden bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
