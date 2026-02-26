'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Brain,
  CheckSquare,
  Wrench,
  TrendingUp,
  Linkedin,
  Mic,
  Activity,
  Users,
  Zap,
} from 'lucide-react'
import './globals.css'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/docs', label: 'Docs', icon: FileText },
  { href: '/memory', label: 'Memory', icon: Brain },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/amazon-ads', label: 'Amazon Ads', icon: TrendingUp },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { href: '/podcasts', label: 'Podcasts', icon: Mic },
  { href: '/system', label: 'System', icon: Activity },
  { href: '/team', label: 'Team', icon: Users },
]

function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 shrink-0 bg-[#0a0a0a] text-white min-h-screen flex flex-col border-r border-[#1f2937]">
      <div className="px-5 py-5 border-b border-[#1f2937] flex items-center gap-2">
        <Zap className="text-[#00ff41]" size={20} />
        <span className="font-semibold text-base tracking-tight">Mission Control</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-[#00ff41] text-[#0a0a0a] shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                  : 'text-[#6b7280] hover:bg-[#111827] hover:text-[#e2e8f0]'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-[#1f2937] text-xs text-[#6b7280]">
        OpenClaw · Neo
      </div>
    </aside>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#e2e8f0] antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
