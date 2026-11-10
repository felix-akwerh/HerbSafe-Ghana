import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button } from '../../components/ui'
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Reviewer workspace</h1>
          <p className="mt-1 text-muted">Demo view. The pilot will put this behind a reviewer login.</p>
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

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="text-[0.9375rem] text-muted">{s.label}</dt>
            <dd className="font-display text-4xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div>
      <div className="flex flex-wrap gap-x-6 border-b border-line" role="tablist">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" role="tab" aria-selected={filter === f.value} onClick={() => setFilter(f.value)} className={`-mb-px min-h-11 border-b-2 text-base ${filter === f.value ? 'border-brand font-bold text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-line">
        {shown.map((r) => (
          <li key={r.id}>
            <Link to={`/reviewer/${r.id}`} className="group block py-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-mono text-[0.9375rem] text-muted">{r.id}</span>
                <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                {needsUrgentCare(r) && <Badge tone="red">Warning signs</Badge>}
                {r.kind === 'suspicious' && <Badge>Product or advert</Badge>}
                {r.reaction.voiceNote && <Badge tone="blue">Voice note</Badge>}
                {r.sample && <Badge>Sample</Badge>}
              </div>
              <p className="mt-1.5 font-display text-xl font-semibold group-hover:text-brand">{r.product.name || 'Product not named'}</p>
              <p className="max-w-2xl text-ink">{r.kind === 'reaction' ? r.reaction.description || r.reaction.symptoms.join(', ') || 'Voice note only' : r.suspicious.issue}</p>
              <p className="mt-1.5 text-[0.9375rem] text-muted">
                {ROLE_LABEL[r.reporter.role]}
                {r.reporter.town && ` · ${r.reporter.town}`} · {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                {r.kind === 'reaction' && ` · ${completeness(r)}% complete`}
              </p>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="py-5 text-muted">Nothing here.</li>}
      </ul>
      </div>
    </div>
  )
}
