import { useRoutes, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Adoption from './pages/Adoption'
import Usage from './pages/Usage'
import Value from './pages/Value'
import Cost from './pages/Cost'
import Errors from './pages/Errors'
import Channels from './pages/Channels'
import Health from './pages/Health'
import Growth from './pages/Growth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function AppRouter() {
  return useRoutes([
    { path: '/login', element: <Login /> },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Overview /> },
        { path: 'adoption', element: <Adoption /> },
        { path: 'usage', element: <Usage /> },
        { path: 'value', element: <Value /> },
        { path: 'cost', element: <Cost /> },
        { path: 'errors', element: <Errors /> },
        { path: 'channels', element: <Channels /> },
        { path: 'health', element: <Health /> },
        { path: 'growth', element: <Growth /> },
      ],
    },
  ])
}
