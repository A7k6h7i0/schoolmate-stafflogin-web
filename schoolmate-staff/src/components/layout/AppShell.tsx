import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const currentNav = NAV_ITEMS.find((item) => item.href === location.pathname)
  const title = currentNav?.title ?? 'Schoolmate Staff'

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:pl-0">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
