import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, LinkButton, UrgentBanner } from '../components/ui'
import { needsUrgentCare } from '../lib/completeness'
import { findReport } from '../lib/store'
import type { Report } from '../lib/types'

export default function Submitted() {
  const { id = '' } = useParams()
  const [report, setReport] = useState<Report | null>(null)
  useEffect(() => {
    findReport(id).then((r) => setReport(r ?? null))
  }, [id])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Thank you. We have your report.</h1>
        <div className="mt-6 border-y border-ink py-4">
          <p className="text-[0.9375rem] text-muted">Your tracking code</p>
          <p className="mt-1 select-all font-mono text-4xl font-bold tracking-wide text-ink">{id}</p>
        </div>
        <p className="mt-3 text-muted">Write it down or take a screenshot. You will need it to check on your report.</p>
      </div>
      {report && needsUrgentCare(report) && <UrgentBanner />}
      <Card title="What happens next">
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
          <li>A pharmacist will read your report.</li>
          <li>If you gave a phone number, they may call or message you with a question.</li>
          <li>{report?.kind === 'suspicious' ? 'If the concern is confirmed, it is passed to the FDA to investigate.' : 'Keep the product and its pack. Do not throw it away yet.'}</li>
          {report?.kind === 'reaction' && <li>If you feel worse, go to a hospital or clinic and take the product with you.</li>}
        </ul>
      </Card>
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton to={`/track/${id}`}>Track this report</LinkButton>
        <LinkButton to="/" variant="secondary">
          Back to home
        </LinkButton>
      </div>
      <p className="text-[0.9375rem] text-muted">
        Prototype note: this report was saved on this device only. Open the <Link to="/reviewer" className="underline">reviewer workspace</Link> to see it arrive.
      </p>
    </div>
  )
}
