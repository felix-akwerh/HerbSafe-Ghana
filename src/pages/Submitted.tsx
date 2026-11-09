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
    <div className="space-y-5">
      <Card className="border-leaf-600 text-center">
        <p className="text-lg font-semibold text-leaf-800">Thank you. We have your report.</p>
        <p className="mt-3 text-stone-700">Your tracking code</p>
        <p className="mt-1 select-all font-mono text-4xl font-bold tracking-wider text-leaf-900">{id}</p>
        <p className="mt-3 text-stone-700">Write it down or take a screenshot. You will need it to check on your report.</p>
      </Card>
      {report && needsUrgentCare(report) && <UrgentBanner />}
      <Card>
        <h2 className="text-lg font-bold">What happens next</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-800">
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
      <p className="text-sm text-stone-600">
        Prototype note: this report was saved on this device only. Open the <Link to="/reviewer" className="underline">reviewer workspace</Link> to see it arrive.
      </p>
    </div>
  )
}
