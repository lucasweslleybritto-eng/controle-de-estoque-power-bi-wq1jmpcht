import { Home, Table, Info, Truck, Box } from 'lucide-react'
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
    title: 'Planilha Geral',
    url: '/spreadsheet',
    icon: Table,
  },
  {
    title: 'Equipamentos',
    url: '/equipment',
    icon: Truck,
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
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 px-2">
          <Box className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            Logística Twin
          </span>
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
