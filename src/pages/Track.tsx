import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, inputClass } from '../components/ui'
import { findReport } from '../lib/store'
import { STATUS_LABEL, type Report, type ReportStatus } from '../lib/types'

const PATH: ReportStatus[] = ['received', 'in_review', 'confirmed', 'sent_to_fda']

export default function Track() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(id ?? '')
  const [report, setReport] = useState<Report | null | undefined>(undefined)

  useEffect(() => {
    if (id) void findReport(id).then((r) => setReport(r ?? null))
  }, [id])

  const reached = report ? PATH.indexOf(report.status === 'needs_info' ? 'in_review' : report.status) : -1

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Track my report</h1>
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          if (code.trim()) navigate(`/track/${code.trim().toUpperCase()}`)
        }}
      >
        <input className={`${inputClass} font-mono uppercase`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="HS-ABC-234" aria-label="Tracking code" />
        <Button type="submit">Find</Button>
      </form>
      {!id && <p className="text-sm text-stone-600">Try the sample codes HS-DEMO-02 or HS-DEMO-03.</p>}

      {id && report === null && <Card className="border-amber-300">We could not find a report with that code. Check the letters and numbers and try again.</Card>}

      {id && report && (
        <>
          <Card>
            <p className="font-mono text-lg font-bold">{report.id}</p>
            <p className="text-stone-700">
              {report.product.name} · sent {new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {report.status === 'closed' ? (
              <p className="mt-4 font-semibold">This report has been closed.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {PATH.map((s, i) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i <= reached ? 'bg-leaf-700 text-white' : 'bg-stone-200 text-stone-500'}`}>{i <= reached ? '✓' : i + 1}</span>
                    <span className={i <= reached ? 'font-semibold' : 'text-stone-500'}>{STATUS_LABEL[s]}</span>
                  </li>
                ))}
              </ol>
            )}
            {report.status === 'needs_info' && <p className="mt-4 rounded-xl bg-amber-100 px-3 py-2 font-semibold text-amber-950">The reviewer needs more information from you. See the message below.</p>}
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Messages from the reviewer</h2>
            {report.review.followUps.length === 0 ? (
              <p className="mt-1 text-stone-700">No messages yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {report.review.followUps.map((f) => (
                  <li key={f.at} className="rounded-xl bg-stone-100 px-3 py-2">
                    <p>{f.text}</p>
                    <p className="text-sm text-stone-600">{new Date(f.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
