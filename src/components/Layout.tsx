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

export default function Layout() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const getBreadcrumbName = (segment: string) => {
    const decoded = decodeURIComponent(segment)
    if (decoded === 'spreadsheet') return 'Planilha Geral'
    if (decoded === 'equipment') return 'Equipamentos'
    if (decoded === 'how-it-works') return 'Como Funciona'
    if (decoded === 'street') return 'Rua'
    if (decoded === 'location') return 'Localização'
    return decoded.charAt(0).toUpperCase() + decoded.slice(1)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 h-10 w-10" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Dashboard</Link>
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
        </header>
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-[100vw] overflow-x-hidden bg-slate-50/50">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
