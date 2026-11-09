export type ReporterRole = 'self' | 'other' | 'seller' | 'clinician'
export type ReportKind = 'reaction' | 'suspicious'
export type ReportStatus = 'received' | 'in_review' | 'needs_info' | 'confirmed' | 'sent_to_fda' | 'closed'
export type Outcome = 'recovered' | 'recovering' | 'not_recovered' | 'died' | 'unknown'
export type Sex = 'female' | 'male' | 'unknown'
export type AgeGroup = 'under_5' | '5_17' | '18_44' | '45_64' | '65_plus' | 'unknown'

/** WHO-UMC causality categories, set by the reviewer only. */
export type Causality = 'certain' | 'probable' | 'possible' | 'unlikely' | 'conditional' | 'unassessable'

export interface VoiceNote {
  dataUrl: string
  mime: string
  seconds: number
}

export interface Product {
  id: string
  name: string
  manufacturer: string
  /** Sample numbers only. Real FDA registration numbers load from the register in the pilot build. */
  fdaNumber: string
  form: string
  indication: string
  ingredients: string[]
  status: 'registered' | 'expired'
}

export interface FollowUp {
  at: string
  from: 'reviewer' | 'system'
  text: string
}

export interface Report {
  id: string
  kind: ReportKind
  createdAt: string
  status: ReportStatus
  sample?: boolean
  reporter: { role: ReporterRole; name: string; phone: string; town: string; facility: string }
  patient: { ageGroup: AgeGroup; sex: Sex; pregnant: boolean }
  product: {
    productId: string | null
    name: string
    manufacturer: string
    fdaNumber: string
    batch: string
    boughtFrom: string
    photo: string | null
  }
  use: { reason: string; dose: string; startDate: string; stillTaking: 'yes' | 'no' | 'unknown' }
  reaction: {
    description: string
    voiceNote: VoiceNote | null
    symptoms: string[]
    onsetDate: string
    outcome: Outcome
    warningSigns: string[]
  }
  other: { medicines: string; conditions: string }
  suspicious: { issue: string; details: string; whereSeen: string }
  consent: boolean
  review: {
    transcript: string
    serious: 'yes' | 'no' | ''
    causality: Causality | ''
    notes: string
    followUps: FollowUp[]
  }
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  received: 'Received',
  in_review: 'Being reviewed',
  needs_info: 'More information needed',
  confirmed: 'Reviewed and confirmed',
  sent_to_fda: 'Sent to FDA Ghana',
  closed: 'Closed',
}

export const ROLE_LABEL: Record<ReporterRole, string> = {
  self: 'Person affected',
  other: 'Family member or friend',
  seller: 'Herbal seller or practitioner',
  clinician: 'Health worker',
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  recovered: 'Fully better',
  recovering: 'Getting better',
  not_recovered: 'Not better yet',
  died: 'The person died',
  unknown: 'Not sure',
}

export const AGE_LABEL: Record<AgeGroup, string> = {
  under_5: 'Under 5',
  '5_17': '5 to 17',
  '18_44': '18 to 44',
  '45_64': '45 to 64',
  '65_plus': '65 or older',
  unknown: 'Not sure',
}

export const CAUSALITY_LABEL: Record<Causality, string> = {
  certain: 'Certain',
  probable: 'Probable / likely',
  possible: 'Possible',
  unlikely: 'Unlikely',
  conditional: 'Conditional / unclassified',
  unassessable: 'Unassessable',
}

export function emptyReport(kind: ReportKind = 'reaction'): Report {
  return {
    id: '',
    kind,
    createdAt: '',
    status: 'received',
    reporter: { role: 'self', name: '', phone: '', town: '', facility: '' },
    patient: { ageGroup: 'unknown', sex: 'unknown', pregnant: false },
    product: { productId: null, name: '', manufacturer: '', fdaNumber: '', batch: '', boughtFrom: '', photo: null },
    use: { reason: '', dose: '', startDate: '', stillTaking: 'unknown' },
    reaction: { description: '', voiceNote: null, symptoms: [], onsetDate: '', outcome: 'unknown', warningSigns: [] },
    other: { medicines: '', conditions: '' },
    suspicious: { issue: '', details: '', whereSeen: '' },
    consent: false,
    review: { transcript: '', serious: '', causality: '', notes: '', followUps: [] },
  }
}
