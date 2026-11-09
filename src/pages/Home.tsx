import { Link } from 'react-router-dom'
import { Card, LinkButton } from '../components/ui'

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-leaf-900 px-5 py-8 text-white sm:px-8">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Did a herbal medicine make you or someone else unwell?</h1>
        <p className="mt-3 max-w-xl text-lg text-leaf-100">Tell us what happened. It takes about three minutes, you can speak instead of typing, and you do not need an account.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/report" className="bg-white !text-leaf-900 hover:bg-leaf-50">
            Report a reaction
          </LinkButton>
          <LinkButton to="/products" className="border border-leaf-200 bg-transparent hover:bg-leaf-800">
            Check a product
          </LinkButton>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Seen a fake or worrying product?</h2>
          <p className="mt-1 text-stone-700">Report a product with no registration number, or an advert that promises to cure everything.</p>
          <Link to="/suspicious" className="mt-3 inline-block font-semibold text-leaf-800 underline">
            Report a product or advert
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Already sent a report?</h2>
          <p className="mt-1 text-stone-700">Use your tracking code to see what has happened and read messages from the reviewer.</p>
          <Link to="/track" className="mt-3 inline-block font-semibold text-leaf-800 underline">
            Track my report
          </Link>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold">What happens to your report</h2>
        <ol className="mt-3 space-y-3">
          {[
            ['You tell us', 'By voice note or typing. You get a tracking code straight away.'],
            ['A pharmacist reads it', 'They may call or message you if something is unclear.'],
            ['It goes to FDA Ghana', 'Confirmed reports help the FDA find unsafe products and warn others.'],
          ].map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-bold text-leaf-900">{i + 1}</span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-stone-700">{text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-stone-600">Your name and number are kept private. Sellers and herbalists: reporting protects your customers and your business.</p>
      </Card>
    </div>
  )
}
