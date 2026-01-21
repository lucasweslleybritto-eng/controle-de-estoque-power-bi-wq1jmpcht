import {
  Home,
  ClipboardList,
  Info,
  Truck,
  ArrowLeftRight,
  History,
  Settings,
  Shield,
} from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Entrada/Saída',
    url: '/movements',
    icon: ArrowLeftRight,
  },
  {
    title: 'Histórico',
    url: '/history',
    icon: History,
  },
  {
    title: 'Planilha Geral',
    url: '/spreadsheet',
    icon: ClipboardList,
  },
  {
    title: 'Equipamentos',
    url: '/equipment',
    icon: Truck,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
  {
    title: 'Como Funciona',
    url: '/how-it-works',
    icon: Info,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4 bg-primary/5">
        <div className="flex items-center gap-3 px-1 transition-all">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-md">
            <Shield className="h-6 w-6 text-black fill-black/10" />
          </div>
          <div className="flex flex-col overflow-hidden transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="font-bold text-sm leading-none text-foreground uppercase whitespace-nowrap">
              8º B Sup Sl
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase whitespace-nowrap">
              Depósito de Fardamento
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="h-12"
                  >
                    <Link to={item.url}>
                      <item.icon
                        className={cn(
                          'h-5 w-5',
                          location.pathname === item.url && 'text-primary',
                        )}
                      />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
