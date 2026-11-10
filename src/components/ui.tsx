import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isoDate } from '../lib/validate'

const base = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-base font-bold transition-colors disabled:opacity-40'
const variants = {
  primary: 'bg-brand text-paper hover:bg-brand-deep',
  secondary: 'border border-ink bg-paper text-ink hover:bg-wash',
  danger: 'border border-danger bg-paper text-danger hover:bg-danger-wash',
}
type Variant = keyof typeof variants

export function Button({ variant = 'primary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest} />
}

export function LinkButton({ to, variant = 'primary', className = '', children }: { to: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  )
}

/** A text link that reads as an action: "Check a product →". */
export function ArrowLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-baseline gap-1.5 font-bold text-brand underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  )
}

/** A flat section set off by a hairline, not a box. Pass `title` for a heading. */
export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border-t border-line pt-6 ${className}`}>
      {title && <h2 className="mb-3 text-xl font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

/** A tinted note: neutral information, a caution, or a danger. The only filled blocks on a page. */
const noteTones = {
  info: 'bg-wash text-ink',
  warn: 'bg-warn-wash text-warn',
  danger: 'bg-danger-wash text-danger',
}
export function Note({ tone = 'info', children, className = '' }: { tone?: keyof typeof noteTones; children: ReactNode; className?: string }) {
  return <div className={`rounded-md px-4 py-3 ${noteTones[tone]} ${className}`}>{children}</div>
}

/** A labelled control. Use `group` when the child brings its own label or buttons (photo picker, recorder). */
export function Field({ label, hint, group = false, children }: { label: string; hint?: string; group?: boolean; children: ReactNode }) {
  const Tag = group ? 'div' : 'label'
  return (
    <Tag className="block">
      <span className="block font-bold text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-[0.9375rem] text-muted">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </Tag>
  )
}

export const inputClass = 'block min-h-12 w-full rounded-md border border-faint bg-paper px-3 py-2 text-base text-ink placeholder:text-faint focus:border-brand'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/**
 * A date written day first, as people in Ghana write it, with the month by name so it
 * cannot be misread. The browser's own date picker follows the phone's settings and often
 * shows mm/dd/yyyy, so it is not used. `value` and `onChange` use yyyy-mm-dd, or '' when
 * the date is not complete.
 */
export function DateInput({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (iso: string) => void }) {
  const [y = '', m = '', d = ''] = value ? value.split('-') : []
  const [parts, setParts] = useState({ day: d ? String(Number(d)) : '', month: m ? String(Number(m)) : '', year: y })
  const update = (next: Partial<typeof parts>) => {
    const all = { ...parts, ...next }
    setParts(all)
    onChange(isoDate(all.day, all.month, all.year))
  }
  const filled = parts.day !== '' && parts.month !== '' && parts.year.length === 4
  const wrong = filled && value === ''
  return (
    <fieldset>
      <legend className="font-bold text-ink">{label}</legend>
      {hint && <p className="mt-0.5 text-[0.9375rem] text-muted">{hint}</p>}
      <div className="mt-2 grid grid-cols-[4.5rem_1fr_5.5rem] gap-2">
        <label className="block">
          <span className="block text-[0.9375rem] text-muted">Day</span>
          <input className={inputClass} inputMode="numeric" maxLength={2} placeholder="DD" aria-invalid={wrong} value={parts.day} onChange={(e) => update({ day: e.target.value.replace(/\D/g, '') })} />
        </label>
        <label className="block">
          <span className="block text-[0.9375rem] text-muted">Month</span>
          <select className={inputClass} aria-invalid={wrong} value={parts.month} onChange={(e) => update({ month: e.target.value })}>
            <option value="">Month</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={String(i + 1)}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[0.9375rem] text-muted">Year</span>
          <input className={inputClass} inputMode="numeric" maxLength={4} placeholder="YYYY" aria-invalid={wrong} value={parts.year} onChange={(e) => update({ year: e.target.value.replace(/\D/g, '') })} />
        </label>
      </div>
      {wrong && <p className="mt-1 text-[0.9375rem] font-bold text-danger">That date does not exist. Please check the day and month.</p>}
    </fieldset>
  )
}

/** Big tappable choices: one of several (radio) or any of several (checkbox). */
export function Choices<T extends string>({ legend, hint, options, value, onChange, columns = 1 }: {
  legend: string
  hint?: string
  options: { value: T; label: string }[]
  value: T | T[]
  onChange: (next: T) => void
  columns?: 1 | 2
}) {
  const many = Array.isArray(value)
  const on = (v: T) => (many ? value.includes(v) : value === v)
  return (
    <fieldset>
      <legend className="font-bold text-ink">{legend}</legend>
      {hint && <p className="mt-0.5 text-[0.9375rem] text-muted">{hint}</p>}
      <div className={`mt-2 grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {options.map((o) => {
          const selected = on(o.value)
          return (
            <button
              key={o.value}
              type="button"
              role={many ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={`flex min-h-12 items-center gap-3 rounded-md border px-3 py-2 text-left text-base leading-snug ${
                selected ? 'border-brand bg-wash text-ink ring-1 ring-brand' : 'border-line bg-paper text-ink hover:border-faint'
              }`}
            >
              <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center border ${many ? 'rounded-[3px]' : 'rounded-full'} ${selected ? 'border-brand bg-brand text-paper' : 'border-faint'}`}>
                {selected && (many ? <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2.5 6.2l2.4 2.4 4.6-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span className="h-2 w-2 rounded-full bg-paper" />)}
              </span>
              <span className="min-w-0">{o.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

const tones = {
  green: 'text-brand',
  amber: 'text-warn',
  red: 'text-danger',
  grey: 'text-muted',
  blue: 'text-ink',
}

/** Status as a small dot and word, so a list of reports stays quiet until one needs attention. */
export function Badge({ tone = 'grey', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.9375rem] font-bold ${tones[tone]}`}>
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
      {children}
    </span>
  )
}

export function UrgentBanner() {
  return (
    <div role="alert" className="rounded-md border-l-4 border-danger bg-danger-wash px-4 py-3 text-danger">
      <p className="font-display text-lg font-semibold">Get medical help now</p>
      <p className="mt-1 text-ink">
        These signs can be dangerous. Go to the nearest hospital or clinic, or call <a className="font-bold underline" href="tel:112">112</a>. Take the
        product with you. You can finish this report later.
      </p>
    </div>
  )
}

/** Label and value pairs set like the print on a medicine pack. */
export function Spec({ rows }: { rows: ([string, ReactNode] | false | '')[] }) {
  return (
    <dl className="grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-1.5">
      {rows.filter((row) => !!row).map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-[0.9375rem] text-muted">{label}</dt>
          <dd className="min-w-0 break-words text-ink">{value || <span className="text-faint">Not given</span>}</dd>
        </div>
      ))}
    </dl>
  )
}
