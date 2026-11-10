import type { Report } from './types'

export interface Check {
  label: string
  done: boolean
  /** One of the four things a report needs before a regulator will accept it as a case. */
  essential: boolean
}

function describesReaction(r: Report): boolean {
  return r.reaction.description.trim() !== '' || r.reaction.voiceNote !== null || r.reaction.symptoms.length > 0 || r.reaction.warningSigns.length > 0
}

export function checks(r: Report): Check[] {
  return [
    { label: 'Someone we can contact', done: r.reporter.phone.trim() !== '' || r.reporter.name.trim() !== '', essential: true },
    { label: 'Who was affected (age or sex)', done: r.patient.ageGroup !== 'unknown' || r.patient.sex !== 'unknown', essential: true },
    { label: 'Which product', done: r.product.name.trim() !== '', essential: true },
    { label: 'What happened', done: describesReaction(r), essential: true },
    { label: 'Product matched to the register', done: r.product.productId !== null, essential: false },
    { label: 'Batch number', done: r.product.batch.trim() !== '', essential: false },
    { label: 'How much was taken', done: r.use.dose.trim() !== '', essential: false },
    { label: 'Date the product was started', done: r.use.startDate !== '', essential: false },
    { label: 'Date the reaction started', done: r.reaction.onsetDate !== '', essential: false },
    { label: 'How the person is now', done: r.reaction.outcome !== 'unknown', essential: false },
    { label: 'Other medicines taken', done: r.other.medicines.trim() !== '', essential: false },
  ]
}

/** 0 to 100. Essentials count double, so a report missing one cannot look nearly complete. */
export function completeness(r: Report): number {
  const list = checks(r)
  const weight = (c: Check) => (c.essential ? 2 : 1)
  const total = list.reduce((sum, c) => sum + weight(c), 0)
  const got = list.reduce((sum, c) => sum + (c.done ? weight(c) : 0), 0)
  return Math.round((got / total) * 100)
}

export function isValidCase(r: Report): boolean {
  return checks(r).filter((c) => c.essential).every((c) => c.done)
}

export function needsUrgentCare(r: Report): boolean {
  return r.reaction.warningSigns.length > 0
}
