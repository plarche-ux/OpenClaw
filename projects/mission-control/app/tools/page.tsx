import { ExternalLink, BarChart2, Linkedin, Globe, Layout } from 'lucide-react'

const tools = [
  {
    title: 'Brand Value Canvas',
    desc: 'AI-powered brand positioning tool using Divided Brain methodology.',
    href: 'https://brand-value-canvas-nzg44.web.app',
    icon: Layout,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    title: 'Amazon Ads Dashboard',
    desc: 'Campaign performance tracker — ACoS, spend, and revenue.',
    href: 'https://docs.google.com/spreadsheets/d/1AcEqHFvH87X2DDXwWnS3O05Ewqp02HoBpUWaMTCh7pY',
    icon: BarChart2,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    title: 'LinkedIn Pipeline',
    desc: 'Track upcoming LinkedIn posts, drafts, and published content.',
    href: 'https://docs.google.com/spreadsheets/d/18x3Xd5oklGNgcZw-1sFSSiuKGHCoETbikyZ_BAR1MhY',
    icon: Linkedin,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'paullarche.com',
    desc: 'Author website — book, speaking, and Brand Value Canvas embed.',
    href: 'https://paullarche.com',
    icon: Globe,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
]

export default function ToolsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Tools</h1>
      <p className="text-slate-400 text-sm mb-8">Launch linked tools and dashboards.</p>

      <div className="grid grid-cols-2 gap-4">
        {tools.map(({ title, desc, href, icon: Icon, color, bg }) => (
          <div
            key={href}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 mb-1">{title}</h2>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Open <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
