import { completeness } from './completeness'
import { AGE_LABEL, CAUSALITY_LABEL, OUTCOME_LABEL, ROLE_LABEL, STATUS_LABEL, type Report } from './types'

function xml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Sellers count as non health professionals here; the reviewer can correct this for licensed medical herbalists.
const QUALIFICATION = { self: '5', other: '5', seller: '5', clinician: '3' } as const
const SEX = { male: '1', female: '2', unknown: '' } as const
const OUTCOME = { recovered: '1', recovering: '2', not_recovered: '3', died: '5', unknown: '0' } as const

export function narrative(r: Report): string {
  const said = r.reaction.description.trim() || r.review.transcript.trim()
  const parts = [
    `${ROLE_LABEL[r.reporter.role]} reported a suspected reaction to "${r.product.name}".`,
    `Patient: age ${AGE_LABEL[r.patient.ageGroup].toLowerCase()}, sex ${r.patient.sex}${r.patient.pregnant ? ', pregnant' : ''}.`,
    r.use.reason && `Taken for: ${r.use.reason}.`,
    r.use.dose && `Dose: ${r.use.dose}.`,
    said && `Reporter's words: ${said}`,
    r.reaction.symptoms.length > 0 && `Symptoms ticked: ${r.reaction.symptoms.join('; ')}.`,
    r.reaction.warningSigns.length > 0 && `Warning signs: ${r.reaction.warningSigns.join('; ')}.`,
    r.other.medicines && `Other medicines: ${r.other.medicines}.`,
    r.other.conditions && `Other conditions: ${r.other.conditions}.`,
    `Outcome: ${OUTCOME_LABEL[r.reaction.outcome]}.`,
    r.review.causality && `Reviewer causality (WHO-UMC): ${CAUSALITY_LABEL[r.review.causality]}.`,
  ]
  return parts.filter(Boolean).join(' ')
}

/**
 * A draft that lists the report against ICH E2B(R3) data element numbers.
 * It is a field map for a reviewer to check, not a schema-valid HL7 ICSR message.
 */
export function toE2bDraft(r: Report): string {
  const fields: [string, string, string][] = [
    ['C.1.1', 'Sender safety report unique identifier', `GH-HERBSAFE-${r.id}`],
    ['C.1.2', 'Date of creation', new Date().toISOString().slice(0, 10)],
    ['C.1.3', 'Type of report (1 = spontaneous)', '1'],
    ['C.1.4', 'Date report first received', r.createdAt.slice(0, 10)],
    ['C.2.r.3', 'Reporter country', 'GH'],
    ['C.2.r.4', 'Reporter qualification (3 = other health professional, 5 = consumer)', QUALIFICATION[r.reporter.role]],
    ['D.2.3', 'Patient age group (as reported)', AGE_LABEL[r.patient.ageGroup]],
    ['D.5', 'Sex (1 = male, 2 = female)', SEX[r.patient.sex]],
    ['D.7.2', 'Relevant medical history (text)', r.other.conditions],
    ['E.i.1.1a', 'Reaction as reported by the primary source', r.reaction.description || r.reaction.symptoms.join('; ')],
    ['E.i.4', 'Date of start of reaction', r.reaction.onsetDate],
    ['E.i.7', 'Outcome (1 recovered, 2 recovering, 3 not recovered, 5 fatal, 0 unknown)', OUTCOME[r.reaction.outcome]],
    ['G.k.1', 'Characterisation of drug role (1 = suspect)', '1'],
    ['G.k.2.2', 'Medicinal product name as reported', r.product.name],
    ['G.k.3.1', 'Authorisation number (sample data in this prototype)', r.product.fdaNumber],
    ['G.k.4.r.4', 'Date of start of drug', r.use.startDate],
    ['G.k.4.r.7', 'Batch / lot number', r.product.batch],
    ['G.k.4.r.8', 'Dosage text', r.use.dose],
    ['G.k.7.r.1', 'Indication as reported', r.use.reason],
    ['H.1', 'Case narrative', narrative(r)],
    ['H.4', 'Sender comments', r.review.notes],
  ]
  const body = fields
    .map(([id, name, value]) => `  <field id="${id}" name="${xml(name)}">${xml(value)}</field>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- HerbSafe Ghana draft. E2B(R3) field map for reviewer checking; not a schema-valid ICSR. -->\n<icsrDraft case="${xml(r.id)}">\n${body}\n</icsrDraft>\n`
}

function cell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function toCsv(reports: Report[]): string {
  const header = ['Code', 'Type', 'Received', 'Status', 'Reporter', 'Town', 'Product', 'FDA number', 'Batch', 'Symptoms', 'Warning signs', 'Outcome', 'Serious', 'Causality', 'Completeness %']
  const rows = reports.map((r) => [
    r.id,
    r.kind === 'reaction' ? 'Reaction' : 'Suspicious product or advert',
    r.createdAt.slice(0, 10),
    STATUS_LABEL[r.status],
    ROLE_LABEL[r.reporter.role],
    r.reporter.town,
    r.product.name,
    r.product.fdaNumber,
    r.product.batch,
    r.reaction.symptoms.join('; '),
    r.reaction.warningSigns.join('; '),
    OUTCOME_LABEL[r.reaction.outcome],
    r.review.serious,
    r.review.causality ? CAUSALITY_LABEL[r.review.causality] : '',
    String(completeness(r)),
  ])
  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\n') + '\n'
}

export function download(filename: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
