import { useMemo, useState } from 'react'
import { searchProducts } from '../lib/seed'
import type { Product } from '../lib/types'
import { Badge, inputClass } from './ui'

export function StatusBadge({ product }: { product: Product }) {
  return product.status === 'registered' ? <Badge tone="green">Registered</Badge> : <Badge tone="amber">Registration expired</Badge>
}

/** Search box with tappable results. Calls onPick with the product, or with null when the text no longer matches a pick. */
export default function ProductPicker({ text, onText, onPick }: { text: string; onText: (t: string) => void; onPick: (p: Product) => void }) {
  const [open, setOpen] = useState(false)
  const results = useMemo(() => searchProducts(text), [text])
  return (
    <div>
      <input
        className={inputClass}
        value={text}
        placeholder="Type the name on the pack, e.g. bitters"
        aria-label="Product name"
        onChange={(e) => {
          onText(e.target.value)
          setOpen(true)
        }}
      />
      {open && text.trim().length >= 2 && (
        <ul className="mt-2 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-300 bg-white">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-3 text-left hover:bg-leaf-50"
                onClick={() => {
                  onPick(p)
                  setOpen(false)
                }}
              >
                <span>
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-sm text-stone-600">
                    {p.manufacturer} · {p.form}
                  </span>
                </span>
                <StatusBadge product={p} />
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-3 text-stone-700">No match in the register. Keep the name as you typed it and add a photo if you can.</li>}
        </ul>
      )}
    </div>
  )
}
