import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '../../components/ui'
import { completeness, needsUrgentCare } from '../../lib/completeness'
import { download, toCsv } from '../../lib/export'
import { loadReports, resetDemo } from '../../lib/store'
import { ROLE_LABEL, STATUS_LABEL, type Report, type ReportStatus } from '../../lib/types'

const STATUS_TONE: Record<ReportStatus, 'blue' | 'amber' | 'green' | 'grey'> = {
  received: 'blue',
  in_review: 'amber',
  needs_info: 'amber',
  confirmed: 'green',
  sent_to_fda: 'green',
  closed: 'grey',
}

type Filter = 'open' | 'reaction' | 'suspicious' | 'all'
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'open', label: 'Needs action' },
  { value: 'reaction', label: 'Reactions' },
  { value: 'suspicious', label: 'Products and adverts' },
  { value: 'all', label: 'All' },
]
const isOpen = (r: Report) => r.status === 'received' || r.status === 'in_review' || r.status === 'needs_info'

export default function Queue() {
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<Filter>('open')
  const refresh = () => loadReports().then(setReports)
  useEffect(() => {
    void refresh()
  }, [])

  const shown = useMemo(() => {
    const list = reports.filter((r) => (filter === 'open' ? isOpen(r) : filter === 'all' ? true : r.kind === filter))
    // Urgent first, then newest.
    return list.sort((a, b) => Number(needsUrgentCare(b)) - Number(needsUrgentCare(a)) || b.createdAt.localeCompare(a.createdAt))
  }, [reports, filter])

  const stats = [
    { label: 'Needs action', value: reports.filter(isOpen).length },
    { label: 'With warning signs', value: reports.filter((r) => isOpen(r) && needsUrgentCare(r)).length },
    { label: 'Product not matched', value: reports.filter((r) => r.kind === 'reaction' && r.product.productId === null).length },
    { label: 'Sent to FDA', value: reports.filter((r) => r.status === 'sent_to_fda').length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reviewer workspace</h1>
          <p className="text-stone-700">Demo view. The pilot will put this behind a reviewer login.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => download('herbsafe-reports.csv', toCsv(reports), 'text/csv')}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => resetDemo().then(refresh)}>
            Reset sample data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-4">
            <p className="text-3xl font-bold text-leaf-900">{s.value}</p>
            <p className="text-sm text-stone-700">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" role="tab" aria-selected={filter === f.value} onClick={() => setFilter(f.value)} className={`min-h-10 rounded-full px-4 text-base ${filter === f.value ? 'bg-leaf-800 font-semibold text-white' : 'border border-stone-300 bg-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {shown.map((r) => (
          <li key={r.id}>
            <Link to={`/reviewer/${r.id}`} className="block rounded-2xl border border-stone-200 bg-white p-4 hover:border-leaf-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold">{r.id}</span>
                <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                {needsUrgentCare(r) && <Badge tone="red">Warning signs</Badge>}
                {r.kind === 'suspicious' && <Badge>Product or advert</Badge>}
                {r.reaction.voiceNote && <Badge tone="blue">Voice note</Badge>}
                {r.sample && <Badge>Sample</Badge>}
              </div>
              <p className="mt-2 text-lg font-semibold">{r.product.name || 'Product not named'}</p>
              <p className="text-stone-700">{r.kind === 'reaction' ? r.reaction.description || r.reaction.symptoms.join(', ') || 'Voice note only' : r.suspicious.issue}</p>
              <p className="mt-2 text-sm text-stone-600">
                {ROLE_LABEL[r.reporter.role]}
                {r.reporter.town && ` · ${r.reporter.town}`} · {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                {r.kind === 'reaction' && ` · ${completeness(r)}% complete`}
              </p>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <Card>Nothing here.</Card>}
      </ul>
    </div>
  )
}
