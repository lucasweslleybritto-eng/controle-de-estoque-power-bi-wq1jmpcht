import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import StreetDetail from './pages/StreetDetail'
import LocationDetail from './pages/LocationDetail'
import GeneralSpreadsheet from './pages/GeneralSpreadsheet'
import Equipment from './pages/Equipment'
import HowItWorks from './pages/HowItWorks'
import EntryExit from './pages/EntryExit'
import History from './pages/History'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Reports from './pages/Reports'
import OMManagement from './pages/OMManagement'
import ObsoleteAndBallistic from './pages/ObsoleteAndBallistic'
import BallisticControl from './pages/BallisticControl'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { InventoryProvider } from './stores/useInventoryStore'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { Loader2 } from 'lucide-react'
import useInventoryStore from './stores/useInventoryStore'
import { useEffect } from 'react'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const { setSessionUser, users } = useInventoryStore()

  useEffect(() => {
    if (user && !loading) {
      // Sync auth user with inventory store user
      const dbUser = users.find((u) => u.id === user.id)
      if (dbUser) {
        setSessionUser(dbUser)
      } else {
        // Fallback if user is authenticated but not yet in the cached users list
        // This might happen on first login before sync completes
        // We set a temporary user object based on Auth metadata
        setSessionUser({
          id: user.id,
          name: user.user_metadata.name || user.email || 'Usuário',
          email: user.email || '',
          role: 'VIEWER', // Default safe role
          preferences: {
            lowStockAlerts: true,
            movementAlerts: true,
            emailNotifications: false,
          },
        })
      }
    }
  }, [user, loading, users, setSessionUser])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Carregando sistema...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/street/:id" element={<StreetDetail />} />
        <Route path="/location/:id" element={<LocationDetail />} />
        <Route path="/spreadsheet" element={<GeneralSpreadsheet />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/oms" element={<OMManagement />} />
        <Route path="/obsolete" element={<ObsoleteAndBallistic />} />
        <Route path="/ballistic-control" element={<BallisticControl />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/movements" element={<EntryExit />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
      </Route>
      {/* Catch all route - redirects to 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <AuthProvider>
      <InventoryProvider>
        <BrowserRouter
          future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </BrowserRouter>
      </InventoryProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default App
