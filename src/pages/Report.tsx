import { del, get, set } from 'idb-keyval'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PhotoInput from '../components/PhotoInput'
import ProductPicker from '../components/ProductPicker'
import VoiceRecorder from '../components/VoiceRecorder'
import { Button, Card, Choices, Field, UrgentBanner, inputClass } from '../components/ui'
import { BOUGHT_FROM, SYMPTOMS, TOWNS, WARNING_SIGNS, toggle } from '../lib/options'
import { SAMPLE_PRODUCTS } from '../lib/seed'
import { saveReport } from '../lib/store'
import { newTrackingCode } from '../lib/tracking'
import { AGE_LABEL, OUTCOME_LABEL, ROLE_LABEL, emptyReport, type AgeGroup, type Outcome, type Product, type Report, type ReporterRole } from '../lib/types'

const DRAFT_KEY = 'herbsafe.draft.v1'
const STEPS = ['About you', 'The product', 'What happened', 'A few details', 'Send']

const options = <T extends string>(labels: Record<T, string>) => (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }))
const list = (items: string[]) => items.map((value) => ({ value, label: value }))
const today = () => new Date().toISOString().slice(0, 10)

function pickProduct(r: Report, p: Product): Report {
  return { ...r, product: { ...r.product, productId: p.id, name: p.name, manufacturer: p.manufacturer, fdaNumber: p.fdaNumber } }
}

export default function ReportWizard() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [r, setR] = useState<Report>(emptyReport)
  const [loaded, setLoaded] = useState(false)
  const [restored, setRestored] = useState(false)
  const [problem, setProblem] = useState('')

  // Restore a half-finished report, so a dropped connection or closed tab loses nothing.
  useEffect(() => {
    get<{ step: number; report: Report }>(DRAFT_KEY).then((draft) => {
      const chosen = SAMPLE_PRODUCTS.find((p) => p.id === params.get('product'))
      if (draft) {
        setR(draft.report)
        setStep(draft.step)
        setRestored(true)
      } else if (chosen) {
        setR((prev) => pickProduct(prev, chosen))
      }
      setLoaded(true)
    })
  }, [params])

  useEffect(() => {
    if (loaded) void set(DRAFT_KEY, { step, report: r })
  }, [loaded, step, r])

  const patch = <K extends keyof Report>(key: K, value: Partial<Report[K]>) => setR((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...value } }))
  const someoneElse = r.reporter.role !== 'self'
  const person = someoneElse ? 'the person' : 'you'

  function check(): string {
    if (step === 1 && r.product.name.trim() === '') return 'Please tell us the name of the product, or describe it.'
    if (step === 2 && r.reaction.description.trim() === '' && !r.reaction.voiceNote && r.reaction.symptoms.length === 0)
      return 'Please record a voice note, type what happened, or tick at least one sign.'
    if (step === 4 && !r.consent) return 'Please tick the box to agree before sending.'
    return ''
  }

  function go(next: number) {
    const message = next > step ? check() : ''
    setProblem(message)
    if (message) return
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  async function startOver() {
    await del(DRAFT_KEY)
    setR(emptyReport())
    setStep(0)
    setRestored(false)
  }

  async function submit() {
    const message = check()
    setProblem(message)
    if (message) return
    const report: Report = { ...r, id: newTrackingCode(), createdAt: new Date().toISOString(), status: 'received' }
    await saveReport(report)
    await del(DRAFT_KEY)
    navigate(`/submitted/${report.id}`)
  }

  if (!loaded) return null

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-leaf-800">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="text-2xl font-bold">{STEPS[step]}</h1>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-leaf-700' : 'bg-stone-300'}`} />
          ))}
        </div>
      </div>

      {restored && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-100 px-3 py-2 text-sky-950">
          <span>We kept the report you started earlier.</span>
          <button type="button" className="font-semibold underline" onClick={startOver}>
            Start a new one
          </button>
        </div>
      )}

      {r.reaction.warningSigns.length > 0 && <UrgentBanner />}

      {step === 0 && (
        <Card className="space-y-5">
          <Choices legend="Who are you?" options={options(ROLE_LABEL)} value={r.reporter.role} onChange={(role: ReporterRole) => patch('reporter', { role })} />
          {(r.reporter.role === 'seller' || r.reporter.role === 'clinician') && (
            <Field label={r.reporter.role === 'seller' ? 'Name of your shop or clinic' : 'Name of your facility'}>
              <input className={inputClass} value={r.reporter.facility} onChange={(e) => patch('reporter', { facility: e.target.value })} />
            </Field>
          )}
          <Choices legend={someoneElse ? 'How old is the person who was affected?' : 'How old are you?'} columns={2} options={options(AGE_LABEL)} value={r.patient.ageGroup} onChange={(ageGroup: AgeGroup) => patch('patient', { ageGroup })} />
          <Choices
            legend={someoneElse ? 'Is the person male or female?' : 'Are you male or female?'}
            columns={2}
            options={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]}
            value={r.patient.sex}
            onChange={(sex) => patch('patient', { sex, pregnant: sex === 'female' && r.patient.pregnant })}
          />
          {r.patient.sex === 'female' && (
            <label className="flex min-h-12 items-center gap-3 text-base">
              <input type="checkbox" className="h-6 w-6 accent-leaf-700" checked={r.patient.pregnant} onChange={(e) => patch('patient', { pregnant: e.target.checked })} />
              Pregnant or breastfeeding at the time
            </label>
          )}
        </Card>
      )}

      {step === 1 && (
        <Card className="space-y-5">
          <Field group label="Which herbal product was it?" hint="Start typing and pick it from the list. If it is not there, keep what you typed.">
            <ProductPicker
              text={r.product.name}
              onText={(name) => patch('product', { name, productId: null, manufacturer: '', fdaNumber: '' })}
              onPick={(p) => setR((prev) => pickProduct(prev, p))}
            />
          </Field>
          {r.product.productId ? (
            <p className="rounded-xl bg-leaf-50 px-3 py-2 text-leaf-900">
              Matched to the register: <strong>{r.product.name}</strong>, {r.product.manufacturer} ({r.product.fdaNumber}).
            </p>
          ) : (
            r.product.name.trim() !== '' && <p className="rounded-xl bg-amber-100 px-3 py-2 text-amber-950">Not matched to the register yet. A photo of the pack will help the reviewer identify it.</p>
          )}
          <Field group label="Photo of the pack or bottle" hint="Show the label, the registration number and the batch number if you can.">
            <PhotoInput value={r.product.photo} onChange={(photo) => patch('product', { photo })} />
          </Field>
          <Field label="Batch number" hint="Usually printed near the expiry date. Leave empty if you cannot find it.">
            <input className={inputClass} value={r.product.batch} onChange={(e) => patch('product', { batch: e.target.value })} />
          </Field>
          <Field label="Where was it bought or given?">
            <select className={inputClass} value={r.product.boughtFrom} onChange={(e) => patch('product', { boughtFrom: e.target.value })}>
              <option value="">Choose one</option>
              {BOUGHT_FROM.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-5">
          <div>
            <p className="text-base font-semibold">Tell us what happened in your own words</p>
            <p className="mt-0.5 text-sm text-stone-600">Say what {person} took, what {person} felt, and when it started.</p>
            <div className="mt-2">
              <VoiceRecorder value={r.reaction.voiceNote} onChange={(voiceNote) => patch('reaction', { voiceNote })} />
            </div>
          </div>
          <Field label="Or type it here">
            <textarea className={`${inputClass} min-h-28`} value={r.reaction.description} onChange={(e) => patch('reaction', { description: e.target.value })} />
          </Field>
          <Choices legend="Tick anything that happened" columns={2} options={list(SYMPTOMS)} value={r.reaction.symptoms} onChange={(s) => patch('reaction', { symptoms: toggle(r.reaction.symptoms, s) })} />
          <Choices legend="Did any of these happen?" hint="These need care straight away." options={list(WARNING_SIGNS)} value={r.reaction.warningSigns} onChange={(s) => patch('reaction', { warningSigns: toggle(r.reaction.warningSigns, s) })} />
          <Field label="When did it start?" hint="Your best guess is fine.">
            <input type="date" max={today()} className={inputClass} value={r.reaction.onsetDate} onChange={(e) => patch('reaction', { onsetDate: e.target.value })} />
          </Field>
          <Choices legend={someoneElse ? 'How is the person now?' : 'How are you now?'} options={options(OUTCOME_LABEL)} value={r.reaction.outcome} onChange={(outcome: Outcome) => patch('reaction', { outcome })} />
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-5">
          <p className="text-stone-700">Skip anything you do not know.</p>
          <Field label="What was the product taken for?">
            <input className={inputClass} value={r.use.reason} onChange={(e) => patch('use', { reason: e.target.value })} placeholder="e.g. malaria, waist pain" />
          </Field>
          <Field label="How much, and how often?">
            <input className={inputClass} value={r.use.dose} onChange={(e) => patch('use', { dose: e.target.value })} placeholder="e.g. two tablespoons, morning and evening" />
          </Field>
          <Field label="When was it first taken?">
            <input type="date" max={today()} className={inputClass} value={r.use.startDate} onChange={(e) => patch('use', { startDate: e.target.value })} />
          </Field>
          <Choices
            legend="Is it still being taken?"
            columns={2}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No, stopped' }]}
            value={r.use.stillTaking}
            onChange={(stillTaking) => patch('use', { stillTaking })}
          />
          <Field label="Any other medicines taken at the same time?" hint="Hospital medicines, pharmacy medicines or other herbal products. Write 'none' if none.">
            <textarea className={`${inputClass} min-h-20`} value={r.other.medicines} onChange={(e) => patch('other', { medicines: e.target.value })} />
          </Field>
          <Field label="Any long-term illness?" hint="e.g. high blood pressure, diabetes, sickle cell.">
            <input className={inputClass} value={r.other.conditions} onChange={(e) => patch('other', { conditions: e.target.value })} />
          </Field>
        </Card>
      )}

      {step === 4 && (
        <>
          <Card className="space-y-5">
            <p className="text-stone-700">A pharmacist may need to ask you a question. Your details are kept private and are never shared with the seller or maker.</p>
            <Field label="Phone number" hint="Optional, but without it we cannot contact you.">
              <input type="tel" inputMode="tel" className={inputClass} value={r.reporter.phone} onChange={(e) => patch('reporter', { phone: e.target.value })} placeholder="e.g. 024 123 4567" />
            </Field>
            <Field label="Your name" hint="Optional.">
              <input className={inputClass} value={r.reporter.name} onChange={(e) => patch('reporter', { name: e.target.value })} />
            </Field>
            <Field label="Town or city">
              <select className={inputClass} value={r.reporter.town} onChange={(e) => patch('reporter', { town: e.target.value })}>
                <option value="">Choose one</option>
                {TOWNS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Check your report</h2>
            <dl className="mt-2 space-y-1 text-stone-800">
              <div><dt className="inline font-semibold">Product: </dt><dd className="inline">{r.product.name}{r.product.productId ? ' (matched)' : ' (not matched)'}</dd></div>
              <div><dt className="inline font-semibold">Voice note: </dt><dd className="inline">{r.reaction.voiceNote ? `Yes, ${r.reaction.voiceNote.seconds} seconds` : 'No'}</dd></div>
              {r.reaction.description && <div><dt className="inline font-semibold">In your words: </dt><dd className="inline">{r.reaction.description}</dd></div>}
              {r.reaction.symptoms.length > 0 && <div><dt className="inline font-semibold">Signs: </dt><dd className="inline">{r.reaction.symptoms.join(', ')}</dd></div>}
              <div><dt className="inline font-semibold">Now: </dt><dd className="inline">{OUTCOME_LABEL[r.reaction.outcome]}</dd></div>
            </dl>
            <label className="mt-4 flex items-start gap-3 text-base">
              <input type="checkbox" className="mt-0.5 h-6 w-6 shrink-0 accent-leaf-700" checked={r.consent} onChange={(e) => setR({ ...r, consent: e.target.checked })} />
              <span>I agree that HerbSafe Ghana may review this report and share it with the Food and Drugs Authority to help keep medicines safe.</span>
            </label>
          </Card>
        </>
      )}

      {problem && (
        <p role="alert" className="rounded-xl bg-red-100 px-3 py-2 font-semibold text-red-800">
          {problem}
        </p>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => go(step - 1)}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button className="flex-1" onClick={() => go(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button className="flex-1" onClick={submit}>
            Send report
          </Button>
        )}
      </div>
    </div>
  )
}
