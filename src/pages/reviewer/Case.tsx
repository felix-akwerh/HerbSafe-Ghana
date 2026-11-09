import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SAMPLE_PRODUCTS } from '../../lib/seed'
import { Badge, Button, Card, Field, inputClass } from '../../components/ui'
import { checks, completeness, isValidCase, needsUrgentCare } from '../../lib/completeness'
import { download, toE2bDraft } from '../../lib/export'
import { findReport, saveReport } from '../../lib/store'
import { AGE_LABEL, CAUSALITY_LABEL, OUTCOME_LABEL, ROLE_LABEL, STATUS_LABEL, type Causality, type Report, type ReportStatus } from '../../lib/types'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-1">
      <dt className="text-stone-600">{label}</dt>
      <dd className="text-stone-900">{children || <span className="text-stone-400">Not given</span>}</dd>
    </div>
  )
}

export default function CaseView() {
  const { id = '' } = useParams()
  const [r, setR] = useState<Report | null | undefined>(undefined)
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    findReport(id).then((found) => setR(found ?? null))
  }, [id])

  if (r === undefined) return null
  if (r === null) return <Card>No report with code {id}. <Link className="underline" to="/reviewer">Back to the queue</Link></Card>

  const update = (next: Report) => {
    setR(next)
    setSaved(false)
  }
  const review = (patch: Partial<Report['review']>) => update({ ...r, review: { ...r.review, ...patch } })

  async function save(next: Report = r!) {
    await saveReport(next)
    setR(next)
    setSaved(true)
  }

  function sendMessage() {
    if (!message.trim()) return
    void save({ ...r!, status: 'needs_info', review: { ...r!.review, followUps: [...r!.review.followUps, { at: new Date().toISOString(), from: 'reviewer', text: message.trim() }] } })
    setMessage('')
  }

  const isReaction = r.kind === 'reaction'

  return (
    <div className="space-y-5">
      <Link to="/reviewer" className="font-semibold text-leaf-800 underline">
        Back to the queue
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-mono text-2xl font-bold">{r.id}</h1>
        <Badge tone="blue">{STATUS_LABEL[r.status]}</Badge>
        {needsUrgentCare(r) && <Badge tone="red">Warning signs</Badge>}
        {r.sample && <Badge>Sample</Badge>}
      </div>

      <Card>
        <h2 className="text-lg font-bold">Reporter and patient</h2>
        <dl className="mt-2">
          <Row label="Reporter">{ROLE_LABEL[r.reporter.role]}{r.reporter.name && `, ${r.reporter.name}`}</Row>
          <Row label="Phone">{r.reporter.phone}</Row>
          <Row label="Town">{r.reporter.town}</Row>
          {r.reporter.facility && <Row label="Facility">{r.reporter.facility}</Row>}
          {isReaction && <Row label="Patient">{`${AGE_LABEL[r.patient.ageGroup]}, ${r.patient.sex}${r.patient.pregnant ? ', pregnant or breastfeeding' : ''}`}</Row>}
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Product</h2>
        <dl className="mt-2">
          <Row label="As reported">{r.product.name}</Row>
          <Row label="Register match">{r.product.productId ? `${r.product.manufacturer} (${r.product.fdaNumber})` : ''}</Row>
          {isReaction && <Row label="Batch">{r.product.batch}</Row>}
          {isReaction && <Row label="Bought from">{r.product.boughtFrom}</Row>}
        </dl>
        {r.product.photo && <img src={r.product.photo} alt="Product photo sent by the reporter" className="mt-3 max-h-64 rounded-xl border border-stone-300" />}
        {!r.product.productId && (
          <Field label="Match to a registered product">
            <select
              className={inputClass}
              value=""
              onChange={(e) => {
                const p = SAMPLE_PRODUCTS.find((x) => x.id === e.target.value)
                if (p) update({ ...r, product: { ...r.product, productId: p.id, manufacturer: p.manufacturer, fdaNumber: p.fdaNumber } })
              }}
            >
              <option value="">Not matched (unverified product)</option>
              {SAMPLE_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}, {p.manufacturer}
                </option>
              ))}
            </select>
          </Field>
        )}
      </Card>

      {isReaction ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">What happened</h2>
          {r.reaction.voiceNote && (
            <div>
              <p className="font-semibold">Voice note ({r.reaction.voiceNote.seconds} seconds)</p>
              <audio controls src={r.reaction.voiceNote.dataUrl} className="mt-1 w-full" />
              <Field label="Transcript" hint="Type what the reporter said, in English. Automatic transcription and translation come in a later release.">
                <textarea className={`${inputClass} min-h-24`} value={r.review.transcript} onChange={(e) => review({ transcript: e.target.value })} />
              </Field>
            </div>
          )}
          <dl>
            <Row label="In their words">{r.reaction.description}</Row>
            <Row label="Signs ticked">{r.reaction.symptoms.join(', ')}</Row>
            <Row label="Warning signs">{r.reaction.warningSigns.join(', ')}</Row>
            <Row label="Reaction started">{r.reaction.onsetDate}</Row>
            <Row label="Now">{OUTCOME_LABEL[r.reaction.outcome]}</Row>
            <Row label="Taken for">{r.use.reason}</Row>
            <Row label="Dose">{r.use.dose}</Row>
            <Row label="First taken">{r.use.startDate}</Row>
            <Row label="Still taking">{r.use.stillTaking === 'unknown' ? '' : r.use.stillTaking}</Row>
            <Row label="Other medicines">{r.other.medicines}</Row>
            <Row label="Conditions">{r.other.conditions}</Row>
          </dl>
        </Card>
      ) : (
        <Card>
          <h2 className="text-lg font-bold">Concern</h2>
          <dl className="mt-2">
            <Row label="Issue">{r.suspicious.issue}</Row>
            <Row label="Details">{r.suspicious.details}</Row>
            <Row label="Where seen">{r.suspicious.whereSeen}</Row>
          </dl>
        </Card>
      )}

      {isReaction && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Completeness: {completeness(r)}%</h2>
            {isValidCase(r) ? <Badge tone="green">Has the four essentials</Badge> : <Badge tone="amber">Missing an essential</Badge>}
          </div>
          <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {checks(r).map((c) => (
              <li key={c.label} className={c.done ? 'text-stone-800' : c.essential ? 'font-semibold text-red-700' : 'text-stone-500'}>
                {c.done ? '✓' : '○'} {c.label}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="space-y-4">
        <h2 className="text-lg font-bold">Review</h2>
        {isReaction && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Serious?">
              <select className={inputClass} value={r.review.serious} onChange={(e) => review({ serious: e.target.value as Report['review']['serious'] })}>
                <option value="">Not assessed</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field label="Causality (WHO-UMC)">
              <select className={inputClass} value={r.review.causality} onChange={(e) => review({ causality: e.target.value as Causality | '' })}>
                <option value="">Not assessed</option>
                {(Object.keys(CAUSALITY_LABEL) as Causality[]).map((c) => (
                  <option key={c} value={c}>
                    {CAUSALITY_LABEL[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <Field label="Reviewer notes" hint="Not shown to the reporter.">
          <textarea className={`${inputClass} min-h-20`} value={r.review.notes} onChange={(e) => review({ notes: e.target.value })} />
        </Field>
        <Field label="Status">
          <select className={inputClass} value={r.status} onChange={(e) => update({ ...r, status: e.target.value as ReportStatus })}>
            {(Object.keys(STATUS_LABEL) as ReportStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => save()}>Save review</Button>
          {isReaction && (
            <Button variant="secondary" onClick={() => download(`${r.id}-e2b-draft.xml`, toE2bDraft(r), 'application/xml')}>
              Export E2B draft
            </Button>
          )}
          {saved && <span className="font-semibold text-leaf-800" role="status">Saved</span>}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold">Messages to the reporter</h2>
        {r.review.followUps.map((f) => (
          <p key={f.at} className="rounded-xl bg-stone-100 px-3 py-2">
            {f.text} <span className="block text-sm text-stone-600">{new Date(f.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </p>
        ))}
        <Field label="Ask a follow-up question" hint="The reporter sees this when they track their report. Sending sets the status to 'More information needed'.">
          <textarea className={`${inputClass} min-h-20`} value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <Button variant="secondary" onClick={sendMessage}>
          Send message
        </Button>
      </Card>
    </div>
  )
}
