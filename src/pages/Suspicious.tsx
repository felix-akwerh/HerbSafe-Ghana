import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PhotoInput from '../components/PhotoInput'
import { Button, Card, Choices, Field, inputClass } from '../components/ui'
import { SUSPICIOUS_ISSUES, TOWNS } from '../lib/options'
import { saveReport } from '../lib/store'
import { newTrackingCode } from '../lib/tracking'
import { emptyReport, type Report } from '../lib/types'

export default function Suspicious() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [r, setR] = useState<Report>(() => {
    const fresh = emptyReport('suspicious')
    fresh.product.name = params.get('name') ?? ''
    return fresh
  })
  const [problem, setProblem] = useState('')

  async function submit() {
    if (r.product.name.trim() === '' || r.suspicious.issue === '') {
      setProblem('Please name or describe the product, and choose what worries you.')
      return
    }
    const report: Report = { ...r, id: newTrackingCode(), createdAt: new Date().toISOString(), consent: true }
    await saveReport(report)
    navigate(`/submitted/${report.id}`)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Report a product or advert</h1>
        <p className="mt-1 text-stone-700">Use this when nobody has been hurt but something looks wrong. If someone became unwell, report a reaction instead.</p>
      </div>
      <Card className="space-y-5">
        <Field label="Name or description of the product">
          <input className={inputClass} value={r.product.name} onChange={(e) => setR({ ...r, product: { ...r.product, name: e.target.value } })} />
        </Field>
        <Choices legend="What worries you?" options={SUSPICIOUS_ISSUES.map((value) => ({ value, label: value }))} value={r.suspicious.issue} onChange={(issue) => setR({ ...r, suspicious: { ...r.suspicious, issue } })} />
        <Field label="Tell us more" hint="What does the pack or advert say? What made you suspicious?">
          <textarea className={`${inputClass} min-h-24`} value={r.suspicious.details} onChange={(e) => setR({ ...r, suspicious: { ...r.suspicious, details: e.target.value } })} />
        </Field>
        <Field label="Where did you see or buy it?" hint="Shop, market, radio or TV station, social media page.">
          <input className={inputClass} value={r.suspicious.whereSeen} onChange={(e) => setR({ ...r, suspicious: { ...r.suspicious, whereSeen: e.target.value } })} />
        </Field>
        <Field group label="Photo or screenshot">
          <PhotoInput value={r.product.photo} onChange={(photo) => setR({ ...r, product: { ...r.product, photo } })} />
        </Field>
        <Field label="Town or city">
          <select className={inputClass} value={r.reporter.town} onChange={(e) => setR({ ...r, reporter: { ...r.reporter, town: e.target.value } })}>
            <option value="">Choose one</option>
            {TOWNS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Phone number" hint="Optional. Leave empty to report without giving your identity.">
          <input type="tel" inputMode="tel" className={inputClass} value={r.reporter.phone} onChange={(e) => setR({ ...r, reporter: { ...r.reporter, phone: e.target.value } })} />
        </Field>
      </Card>
      {problem && (
        <p role="alert" className="rounded-xl bg-red-100 px-3 py-2 font-semibold text-red-800">
          {problem}
        </p>
      )}
      <Button className="w-full" onClick={submit}>
        Send
      </Button>
    </div>
  )
}
