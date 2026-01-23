import {
  Home,
  ClipboardList,
  Info,
  Truck,
  ArrowLeftRight,
  History,
  Settings,
  Users,
  BarChart,
  Building2,
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
import logo8BSup from '@/assets/8-b-sup.jpg'
import useInventoryStore from '@/stores/useInventoryStore'

export function AppSidebar() {
  const location = useLocation()
  const { currentUser } = useInventoryStore()

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
      title: 'Gestão de OMs',
      url: '/oms',
      icon: Building2,
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
      title: 'Relatórios',
      url: '/reports',
      icon: BarChart,
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

  // Add Users menu only for ADMIN
  if (currentUser?.role === 'ADMIN') {
    // Insert Users before Settings
    const settingsIndex = items.findIndex((i) => i.title === 'Configurações')
    items.splice(settingsIndex, 0, {
      title: 'Usuários',
      url: '/users',
      icon: Users,
    })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4 bg-sidebar-background">
        <div className="flex items-center gap-3 px-1 transition-all">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full overflow-hidden border-2 border-primary/20 bg-black">
            <img
              src={logo8BSup}
              alt="8º B Sup Sl"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col overflow-hidden transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="font-bold text-sm leading-none text-sidebar-foreground uppercase whitespace-nowrap">
              8º B Sup Sl
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase whitespace-nowrap mt-1">
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
