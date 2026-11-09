import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition disabled:opacity-40'
const variants = {
  primary: 'bg-leaf-800 text-white hover:bg-leaf-900',
  secondary: 'border border-stone-300 bg-white text-stone-900 hover:bg-stone-50',
  danger: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
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

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-stone-200 bg-white p-5 ${className}`}>{children}</div>
}

/** A labelled control. Use `group` when the child brings its own label or buttons (photo picker, recorder). */
export function Field({ label, hint, group = false, children }: { label: string; hint?: string; group?: boolean; children: ReactNode }) {
  const Tag = group ? 'div' : 'label'
  return (
    <Tag className="block">
      <span className="block text-base font-semibold text-stone-900">{label}</span>
      {hint && <span className="mt-0.5 block text-sm text-stone-600">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </Tag>
  )
}

export const inputClass =
  'block min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 placeholder:text-stone-400'

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
      <legend className="text-base font-semibold text-stone-900">{legend}</legend>
      {hint && <p className="mt-0.5 text-sm text-stone-600">{hint}</p>}
      <div className={`mt-2 grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role={many ? 'checkbox' : 'radio'}
            aria-checked={on(o.value)}
            onClick={() => onChange(o.value)}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left text-base ${
              on(o.value) ? 'border-leaf-700 bg-leaf-50 font-semibold text-leaf-900 ring-1 ring-leaf-700' : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

const tones = {
  green: 'bg-leaf-100 text-leaf-900',
  amber: 'bg-amber-100 text-amber-900',
  red: 'bg-red-100 text-red-800',
  grey: 'bg-stone-200 text-stone-800',
  blue: 'bg-sky-100 text-sky-900',
}

export function Badge({ tone = 'grey', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold ${tones[tone]}`}>{children}</span>
}

export function UrgentBanner() {
  return (
    <div role="alert" className="rounded-2xl border-2 border-red-600 bg-red-50 p-4 text-red-900">
      <p className="text-lg font-bold">Get medical help now</p>
      <p className="mt-1">
        These signs can be dangerous. Go to the nearest hospital or clinic, or call <a className="font-bold underline" href="tel:112">112</a>. Take the
        product with you. You can finish this report later.
      </p>
    </div>
  )
}
