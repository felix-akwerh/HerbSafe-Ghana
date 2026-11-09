import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/ProductPicker'
import { searchProducts } from '../lib/seed'
import { Card, inputClass } from '../components/ui'

export default function Products() {
  const [q, setQ] = useState('')
  const results = searchProducts(q)
  const searched = q.trim().length >= 2
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Check a herbal product</h1>
        <p className="mt-1 text-stone-700">Search by the product name, the maker, or the registration number on the pack.</p>
      </div>
      <input autoFocus className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. bitters, malaria, SAMPLE-HM-0003" aria-label="Search products" />
      <p className="rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-950">This prototype searches eight invented sample products. The pilot will search the FDA Ghana register.</p>

      {results.map((p) => (
        <Card key={p.id}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-bold">{p.name}</h2>
            <StatusBadge product={p} />
          </div>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-stone-800 sm:grid-cols-2">
            <div><dt className="inline font-semibold">Maker: </dt><dd className="inline">{p.manufacturer}</dd></div>
            <div><dt className="inline font-semibold">Registration no.: </dt><dd className="inline">{p.fdaNumber}</dd></div>
            <div><dt className="inline font-semibold">Form: </dt><dd className="inline">{p.form}</dd></div>
            <div><dt className="inline font-semibold">Used for: </dt><dd className="inline">{p.indication}</dd></div>
            <div className="sm:col-span-2"><dt className="inline font-semibold">Plant ingredients: </dt><dd className="inline italic">{p.ingredients.join(', ')}</dd></div>
          </dl>
          {p.status === 'expired' && <p className="mt-3 text-amber-900">The registration for this product has run out. It should not be on sale until it is renewed.</p>}
          <Link to={`/report?product=${p.id}`} className="mt-3 inline-block font-semibold text-leaf-800 underline">
            Report a reaction to this product
          </Link>
        </Card>
      ))}

      {searched && results.length === 0 && (
        <Card className="border-amber-300">
          <h2 className="text-lg font-bold">We could not find "{q.trim()}"</h2>
          <p className="mt-1 text-stone-700">It may be spelled differently on the register, or it may not be registered. A product that is not registered has not been checked for safety by the FDA.</p>
          <Link to={`/suspicious?name=${encodeURIComponent(q.trim())}`} className="mt-3 inline-block font-semibold text-leaf-800 underline">
            Tell us about this product
          </Link>
        </Card>
      )}
    </div>
  )
}
