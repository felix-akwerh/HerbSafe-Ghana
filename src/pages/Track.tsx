import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, inputClass, Note } from '../components/ui'
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
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Track my report</h1>
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
      {!id && <p className="text-[0.9375rem] text-muted">Try the sample codes HS-DEMO-02 or HS-DEMO-03.</p>}

      {id && report === null && <Note tone="warn">We could not find a report with that code. Check the letters and numbers and try again.</Note>}

      {id && report && (
        <>
          <Card>
            <p className="font-mono text-xl font-bold">{report.id}</p>
            <p className="text-muted">
              {report.product.name} · sent {new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {report.status === 'closed' ? (
              <p className="mt-4 font-bold">This report has been closed.</p>
            ) : (
              <ol className="mt-5">
                {PATH.map((s, i) => (
                  <li key={s} className={`relative pb-5 pl-7 last:pb-0 ${i < PATH.length - 1 ? 'before:absolute before:top-3 before:bottom-0 before:left-[5px] before:w-0.5 ' + (i < reached ? 'before:bg-brand' : 'before:bg-line') : ''}`}>
                    <span aria-hidden="true" className={`absolute top-1.5 left-0 h-3 w-3 rounded-full border-2 ${i <= reached ? 'border-brand bg-brand' : 'border-faint bg-paper'}`} />
                    <span className={i === reached ? 'font-bold' : i < reached ? 'text-ink' : 'text-faint'}>{STATUS_LABEL[s]}</span>
                    {i === reached && <span className="sr-only"> (current step)</span>}
                  </li>
                ))}
              </ol>
            )}
            {report.status === 'needs_info' && <Note tone="warn" className="mt-5 font-bold">The reviewer needs more information from you. See the message below.</Note>}
          </Card>
          <Card title="Messages from the reviewer">
            {report.review.followUps.length === 0 ? (
              <p className="text-muted">No messages yet.</p>
            ) : (
              <ul className="space-y-4">
                {report.review.followUps.map((f) => (
                  <li key={f.at} className="border-l-2 border-brand pl-4">
                    <p>{f.text}</p>
                    <p className="text-[0.9375rem] text-muted">{new Date(f.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
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
