import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SAMPLE_PRODUCTS } from '../../lib/seed'
import { Badge, Button, Card, Field, Spec, inputClass } from '../../components/ui'
import { checks, completeness, isValidCase, needsUrgentCare } from '../../lib/completeness'
import { download, toE2bDraft } from '../../lib/export'
import { findReport, saveReport } from '../../lib/store'
import { AGE_LABEL, CAUSALITY_LABEL, OUTCOME_LABEL, ROLE_LABEL, STATUS_LABEL, type Causality, type Report, type ReportStatus } from '../../lib/types'

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
    <div className="space-y-8">
      <Link to="/reviewer" className="font-bold text-brand underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
        <span aria-hidden="true">← </span>Back to the queue
      </Link>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="font-mono text-3xl font-bold tracking-normal">{r.id}</h1>
        <Badge tone="blue">{STATUS_LABEL[r.status]}</Badge>
        {needsUrgentCare(r) && <Badge tone="red">Warning signs</Badge>}
        {r.sample && <Badge>Sample</Badge>}
      </div>

      <Card title="Reporter and patient">
        <Spec
          rows={[
            ['Reporter', `${ROLE_LABEL[r.reporter.role]}${r.reporter.name && `, ${r.reporter.name}`}`],
            ['Phone', r.reporter.phone],
            ['Town', r.reporter.town],
            r.reporter.facility && ['Facility', r.reporter.facility],
            isReaction && ['Patient', `${AGE_LABEL[r.patient.ageGroup]}, ${r.patient.sex}${r.patient.pregnant ? ', pregnant or breastfeeding' : ''}`],
          ]}
        />
      </Card>

      <Card title="Product">
        <Spec
          rows={[
            ['As reported', r.product.name],
            ['Register match', r.product.productId ? `${r.product.manufacturer} (${r.product.fdaNumber})` : ''],
            isReaction && ['Batch', r.product.batch],
            isReaction && ['Bought from', r.product.boughtFrom],
          ]}
        />
        {r.product.photo && <img src={r.product.photo} alt="Product photo sent by the reporter" className="mt-4 max-h-64 rounded-md border border-line" />}
        {!r.product.productId && (
          <div className="mt-5">
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
          </div>
        )}
      </Card>

      {isReaction ? (
        <Card title="What happened" className="space-y-5">
          {r.reaction.voiceNote && (
            <div className="space-y-4">
              <div>
              <p className="font-bold">Voice note ({r.reaction.voiceNote.seconds} seconds)</p>
              <audio controls src={r.reaction.voiceNote.dataUrl} className="mt-2 w-full" />
              </div>
              <Field label="Transcript" hint="Type what the reporter said, in English. Automatic transcription and translation come in a later release.">
                <textarea className={`${inputClass} min-h-24`} value={r.review.transcript} onChange={(e) => review({ transcript: e.target.value })} />
              </Field>
            </div>
          )}
          <Spec
            rows={[
              ['In their words', r.reaction.description],
              ['Signs ticked', r.reaction.symptoms.join(', ')],
              ['Warning signs', r.reaction.warningSigns.length > 0 && <span key="w" className="font-bold text-danger">{r.reaction.warningSigns.join(', ')}</span>],
              ['Reaction started', r.reaction.onsetDate],
              ['Now', OUTCOME_LABEL[r.reaction.outcome]],
              ['Taken for', r.use.reason],
              ['Dose', r.use.dose],
              ['First taken', r.use.startDate],
              ['Still taking', r.use.stillTaking === 'unknown' ? '' : r.use.stillTaking],
              ['Other medicines', r.other.medicines],
              ['Conditions', r.other.conditions],
            ]}
          />
        </Card>
      ) : (
        <Card title="Concern">
          <Spec
            rows={[
              ['Issue', r.suspicious.issue],
              ['Details', r.suspicious.details],
              ['Where seen', r.suspicious.whereSeen],
            ]}
          />
        </Card>
      )}

      {isReaction && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-semibold">Completeness: {completeness(r)}%</h2>
            {isValidCase(r) ? <Badge tone="green">Has the four essentials</Badge> : <Badge tone="amber">Missing an essential</Badge>}
          </div>
          <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {checks(r).map((c) => (
              <li key={c.label} className={c.done ? 'text-ink' : c.essential ? 'font-bold text-danger' : 'text-faint'}>
                {c.done ? '✓' : '○'} {c.label}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Review" className="space-y-5">
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
          {saved && <span className="font-bold text-brand" role="status">Saved</span>}
        </div>
      </Card>

      <Card title="Messages to the reporter" className="space-y-5">
        {r.review.followUps.map((f) => (
          <p key={f.at} className="border-l-2 border-brand pl-4">
            {f.text} <span className="block text-[0.9375rem] text-muted">{new Date(f.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
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
