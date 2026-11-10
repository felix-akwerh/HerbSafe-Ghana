import { ArrowLink, Card, LinkButton } from '../components/ui'

const steps = [
  ['You tell us', 'By voice note or typing. You get a tracking code straight away.'],
  ['A pharmacist reads it', 'They may call or message you if something is unclear.'],
  ['It goes to FDA Ghana', 'Confirmed reports help the FDA find unsafe products and warn others.'],
]

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="pt-4">
        <h1 className="text-[2.5rem] font-bold leading-[1.05] sm:text-5xl">Did a herbal medicine make you unwell?</h1>
        <p className="mt-4 text-lg text-muted">Tell us what happened, for yourself or someone else. It takes about three minutes. You can speak instead of typing, and you do not need an account.</p>
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <LinkButton to="/report">Report a reaction</LinkButton>
          <ArrowLink to="/products">Check a product</ArrowLink>
        </div>
      </section>

      <Card title="What happens to your report">
        <ol className="space-y-4">
          {steps.map(([title, text], i) => (
            <li key={title} className="grid grid-cols-[1.75rem_1fr] gap-x-3">
              <span className="font-display text-xl font-semibold text-brand">{i + 1}</span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="block text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <ul className="divide-y divide-line">
          <li className="pb-5">
            <p className="font-bold">Seen a fake or worrying product?</p>
            <p className="mb-2 text-muted">A pack with no registration number, or an advert that promises to cure everything.</p>
            <ArrowLink to="/suspicious">Report a product or advert</ArrowLink>
          </li>
          <li className="py-5">
            <p className="font-bold">Already sent a report?</p>
            <p className="mb-2 text-muted">Use your tracking code to see progress and read messages from the reviewer.</p>
            <ArrowLink to="/track">Track my report</ArrowLink>
          </li>
          <li className="pt-5">
            <p className="font-bold">Do you sell or prescribe herbal medicine?</p>
            <p className="text-muted">Reporting protects your customers and your business. Your name and number are kept private.</p>
          </li>
        </ul>
      </Card>
    </div>
  )
}
