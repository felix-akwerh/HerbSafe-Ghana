import { Card, LinkButton, Note } from '../components/ui'
import { SYMPTOMS, WARNING_SIGNS } from '../lib/options'

export default function Learn() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Using herbal medicine safely</h1>
      <Card title="What is a reaction?">
        <p className="mt-1 text-muted">A reaction is any unwanted change in the body after taking a medicine. Herbal medicines are medicines too, and any medicine can cause one. Common examples:</p>
        <ul className="mt-2 grid list-disc gap-x-6 pl-5 text-ink sm:grid-cols-2">
          {SYMPTOMS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>
      <Note tone="danger" className="border-l-4 border-danger">
        <h2 className="text-xl font-semibold">Go to a hospital now if you notice</h2>
        <ul className="mt-2 list-disc pl-5 text-ink">
          {WARNING_SIGNS.filter((s) => s !== 'Admitted to hospital').map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-2 text-ink">Take the product with you, or a photo of it.</p>
      </Note>
      <Card title="Before you buy">
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
          <li>Look for an FDA registration number, a batch number and an expiry date on the pack.</li>
          <li>Be careful with products that claim to cure many different diseases.</li>
          <li>Do not take more than the label says.</li>
        </ul>
      </Card>
      <Card title="Tell your doctor, nurse or pharmacist">
        <p className="mt-1 text-muted">Always mention any herbal medicine you are taking. Some herbal medicines change how hospital medicines work. Health workers need to know so they can treat you safely.</p>
      </Card>
      <LinkButton to="/report">Report a reaction</LinkButton>
    </div>
  )
}
