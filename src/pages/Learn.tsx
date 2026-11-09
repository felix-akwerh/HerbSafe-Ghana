import { Card, LinkButton } from '../components/ui'
import { SYMPTOMS, WARNING_SIGNS } from '../lib/options'

export default function Learn() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Using herbal medicine safely</h1>
      <Card>
        <h2 className="text-lg font-bold">What is a reaction?</h2>
        <p className="mt-1 text-stone-700">A reaction is any unwanted change in the body after taking a medicine. Herbal medicines are medicines too, and any medicine can cause one. Common examples:</p>
        <ul className="mt-2 grid list-disc gap-x-6 pl-5 text-stone-800 sm:grid-cols-2">
          {SYMPTOMS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>
      <Card className="border-red-300">
        <h2 className="text-lg font-bold text-red-800">Go to a hospital now if you notice</h2>
        <ul className="mt-2 list-disc pl-5 text-stone-800">
          {WARNING_SIGNS.filter((s) => s !== 'Admitted to hospital').map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-2 text-stone-700">Take the product with you, or a photo of it.</p>
      </Card>
      <Card>
        <h2 className="text-lg font-bold">Before you buy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-800">
          <li>Look for an FDA registration number, a batch number and an expiry date on the pack.</li>
          <li>Be careful with products that claim to cure many different diseases.</li>
          <li>Do not take more than the label says.</li>
        </ul>
      </Card>
      <Card>
        <h2 className="text-lg font-bold">Tell your doctor, nurse or pharmacist</h2>
        <p className="mt-1 text-stone-700">Always mention any herbal medicine you are taking. Some herbal medicines change how hospital medicines work. Health workers need to know so they can treat you safely.</p>
      </Card>
      <LinkButton to="/report">Report a reaction</LinkButton>
    </div>
  )
}
