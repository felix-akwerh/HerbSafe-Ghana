import { useState } from 'react'
import { StatusBadge } from '../components/ProductPicker'
import { searchProducts } from '../lib/seed'
import { ArrowLink, Card, inputClass, Note, Spec } from '../components/ui'

export default function Products() {
  const [q, setQ] = useState('')
  const results = searchProducts(q)
  const searched = q.trim().length >= 2
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Check a herbal product</h1>
        <p className="mt-1 text-muted">Search by the product name, the maker, or the registration number on the pack.</p>
      </div>
      <input autoFocus className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. bitters, malaria, SAMPLE-HM-0003" aria-label="Search products" />
      <p className="text-[0.9375rem] text-muted">This prototype searches eight invented sample products. The pilot will search the FDA Ghana register.</p>

      {results.map((p) => (
        <Card key={p.id}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <StatusBadge product={p} />
          </div>
          <Spec
            rows={[
              ['Registration no.', <span key="n" className="font-mono text-[0.9375rem]">{p.fdaNumber}</span>],
              ['Maker', p.manufacturer],
              ['Form', p.form],
              ['Used for', p.indication],
              ['Plant ingredients', <i key="i">{p.ingredients.join(', ')}</i>],
            ]}
          />
          {p.status === 'expired' && <Note tone="warn" className="mt-4">The registration for this product has run out. It should not be on sale until it is renewed.</Note>}
          <p className="mt-4">
            <ArrowLink to={`/report?product=${p.id}`}>Report a reaction to this product</ArrowLink>
          </p>
        </Card>
      ))}

      {searched && results.length === 0 && (
        <Card title={`We could not find "${q.trim()}"`}>
          <p className="text-muted">It may be spelled differently on the register, or it may not be registered. A product that is not registered has not been checked for safety by the FDA.</p>
          <p className="mt-4">
            <ArrowLink to={`/suspicious?name=${encodeURIComponent(q.trim())}`}>Tell us about this product</ArrowLink>
          </p>
        </Card>
      )}
    </div>
  )
}
