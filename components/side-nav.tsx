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
        } fixed md:static inset-y-0 left-0 w-64 bg-background border-r border-border transition-transform duration-300 z-40 md:z-auto flex flex-col`}
      >
        {/* Logo section */}
        <div className="p-6 border-b border-border">
          <BrandLogo />
          <div className="mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Green Steel
            </p>
            <p className="text-xs text-muted-foreground">Sales Support Tool</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsOpen(false) // Close on mobile after selection
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary/60'
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-border text-[11px] text-muted-foreground space-y-1">
          <p>© Saarstahl AG</p>
          <p>DiGreeS Value Simulator</p>
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
