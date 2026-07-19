'use client'

import { BarChart3, Building2, Users, FileText, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { BrandLogo } from './brand-logo'

type NavItem = 'calculator' | 'impact' | 'stakeholder' | 'brief'

export function SideNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: NavItem
  setActiveTab: (tab: NavItem) => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  const navItems = [
    {
      id: 'calculator' as NavItem,
      label: 'Business Value Calculator',
      icon: BarChart3,
    },
    { id: 'impact' as NavItem, label: 'Impact Dashboard', icon: Building2 },
    {
      id: 'stakeholder' as NavItem,
      label: 'Stakeholder Analysis',
      icon: Users,
    },
    { id: 'brief' as NavItem, label: 'AI Sales Brief', icon: FileText },
  ]

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-slate-200 rounded-lg"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static inset-y-0 left-0 w-56 bg-background border-r border-border transition-transform duration-300 z-40 md:z-auto flex flex-col`}
      >
        {/* Logo section - Compact */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BrandLogo />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Green Steel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items - Compact */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary/60'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer info - Compact */}
        <div className="p-2 border-t border-border text-[9px] text-muted-foreground space-y-0.5">
          <p>© Saarstahl AG</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
