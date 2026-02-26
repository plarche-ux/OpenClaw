import { ExternalLink, BarChart2, Linkedin, Globe, Layout, Wrench } from 'lucide-react'

const tools = [
  {
    title: 'Brand Value Canvas',
    desc: 'AI-powered brand positioning tool using Divided Brain methodology.',
    href: 'https://brand-value-canvas-nzg44.web.app',
    icon: Layout,
    color: 'text-[#00ff41]',
    bg: 'bg-[#003d0f]',
  },
  {
    title: 'Amazon Ads Dashboard',
    desc: 'Campaign performance tracker — ACoS, spend, and revenue.',
    href: 'https://docs.google.com/spreadsheets/d/1AcEqHFvH87X2DDXwWnS3O05Ewqp02HoBpUWaMTCh7pY',
    icon: BarChart2,
    color: 'text-[#00ff41]',
    bg: 'bg-[#003d0f]',
  },
  {
    title: 'LinkedIn Pipeline',
    desc: 'Track upcoming LinkedIn posts, drafts, and published content.',
    href: 'https://docs.google.com/spreadsheets/d/18x3Xd5oklGNgcZw-1sFSSiuKGHCoETbikyZ_BAR1MhY',
    icon: Linkedin,
    color: 'text-[#00ff41]',
    bg: 'bg-[#003d0f]',
  },
  {
    title: 'paullarche.com',
    desc: 'Author website — book, speaking, and Brand Value Canvas embed.',
    href: 'https://paullarche.com',
    icon: Globe,
    color: 'text-[#00ff41]',
    bg: 'bg-[#003d0f]',
  },
]

export default function ToolsPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Wrench size={22} className="text-[#00ff41]" />
        <h1 className="text-2xl font-bold text-white">Tools</h1>
      </div>
      <p className="text-[#6b7280] text-sm mb-8">Launch linked tools and dashboards.</p>

      <div className="grid grid-cols-2 gap-4">
        {tools.map(({ title, desc, href, icon: Icon, color, bg }) => (
          <div
            key={href}
            className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 flex flex-col gap-4 hover:border-[#00ff41]/50 hover:shadow-[0_0_15px_rgba(0,255,65,0.1)] transition-all"
          >
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <h2 className="font-semibold text-white mb-1">{title}</h2>
              <p className="text-sm text-[#6b7280]">{desc}</p>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-[#00ff41] hover:text-[#00cc33] transition-colors"
            >
              Open <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
