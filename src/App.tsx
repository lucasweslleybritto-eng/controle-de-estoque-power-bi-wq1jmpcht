import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { InventoryProvider } from './stores/useInventoryStore'

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <InventoryProvider>
      <BrowserRouter
        future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </InventoryProvider>
  </ThemeProvider>
)

export default App
