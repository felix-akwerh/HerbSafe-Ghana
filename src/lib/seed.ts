import { emptyReport, type Product, type Report } from './types'

/**
 * SAMPLE DATA ONLY. These products are invented for the prototype. They are not real
 * products, and the numbers are not real FDA Ghana registration numbers.
 */
export const SAMPLE_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Sample Herbal Bitters', manufacturer: 'Demo Herbal Works, Accra', fdaNumber: 'SAMPLE-HM-0001', form: 'Liquid, 500 ml', indication: 'General wellbeing', ingredients: ['Khaya senegalensis bark', 'Azadirachta indica leaf'], status: 'registered' },
  { id: 'p2', name: 'Sample Malaria Mixture', manufacturer: 'Example Phyto Ltd, Kumasi', fdaNumber: 'SAMPLE-HM-0002', form: 'Liquid, 330 ml', indication: 'Uncomplicated malaria', ingredients: ['Cryptolepis sanguinolenta root'], status: 'registered' },
  { id: 'p3', name: 'Sample Vitality Capsules', manufacturer: 'Demo Herbal Works, Accra', fdaNumber: 'SAMPLE-HM-0003', form: 'Capsules, 30', indication: 'Male vitality', ingredients: ['Paullinia pinnata root', 'Zingiber officinale rhizome'], status: 'expired' },
  { id: 'p4', name: 'Sample Blood Tonic', manufacturer: 'Placeholder Naturals, Tema', fdaNumber: 'SAMPLE-HM-0004', form: 'Liquid, 200 ml', indication: 'Blood tonic', ingredients: ['Hibiscus sabdariffa calyx', 'Sorghum bicolor leaf'], status: 'registered' },
  { id: 'p5', name: 'Sample Pile Remedy', manufacturer: 'Example Phyto Ltd, Kumasi', fdaNumber: 'SAMPLE-HM-0005', form: 'Powder, 100 g', indication: 'Haemorrhoids', ingredients: ['Senna alata leaf'], status: 'registered' },
  { id: 'p6', name: 'Sample Cough Syrup', manufacturer: 'Placeholder Naturals, Tema', fdaNumber: 'SAMPLE-HM-0006', form: 'Syrup, 125 ml', indication: 'Cough', ingredients: ['Zingiber officinale rhizome', 'Citrus aurantiifolia fruit'], status: 'registered' },
  { id: 'p7', name: 'Sample Joint Rub', manufacturer: 'Demo Herbal Works, Accra', fdaNumber: 'SAMPLE-HM-0007', form: 'Ointment, 50 g', indication: 'Joint and muscle pain', ingredients: ['Capsicum annuum fruit', 'Vitellaria paradoxa butter'], status: 'registered' },
  { id: 'p8', name: 'Sample Fertility Tea', manufacturer: 'Illustration Herbs, Kumasi', fdaNumber: 'SAMPLE-HM-0008', form: 'Tea bags, 20', indication: 'Reproductive health', ingredients: ['Moringa oleifera leaf'], status: 'expired' },
]

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 864e5).toISOString()
}

/** Invented example reports so the reviewer workspace is not empty on first open. */
export function sampleReports(): Report[] {
  const a = emptyReport()
  Object.assign(a, { id: 'HS-DEMO-01', createdAt: daysAgo(1), status: 'received', sample: true, consent: true })
  a.reporter = { role: 'self', name: 'Sample reporter A', phone: '020 000 0001', town: 'Accra', facility: '' }
  a.patient = { ageGroup: '18_44', sex: 'female', pregnant: false }
  a.product = { productId: 'p1', name: 'Sample Herbal Bitters', manufacturer: 'Demo Herbal Works, Accra', fdaNumber: 'SAMPLE-HM-0001', batch: 'B2207', boughtFrom: 'Herbal shop', photo: null }
  a.use = { reason: 'Stomach upset', dose: 'Two tablespoons, morning and evening', startDate: daysAgo(6).slice(0, 10), stillTaking: 'no' }
  a.reaction = { description: 'Itchy rash on both arms and chest on the third day. It went down two days after I stopped.', voiceNote: null, symptoms: ['Skin rash or itching'], onsetDate: daysAgo(3).slice(0, 10), outcome: 'recovering', warningSigns: [] }
  a.other = { medicines: 'None', conditions: 'None' }

  const b = emptyReport()
  Object.assign(b, { id: 'HS-DEMO-02', createdAt: daysAgo(2), status: 'in_review', sample: true, consent: true })
  b.reporter = { role: 'seller', name: 'Sample seller B', phone: '024 000 0002', town: 'Kumasi', facility: 'Example Herbal Shop, Kejetia' }
  b.patient = { ageGroup: '45_64', sex: 'male', pregnant: false }
  b.product = { productId: null, name: 'Unlabelled brown mixture in a reused bottle', manufacturer: '', fdaNumber: '', batch: '', boughtFrom: 'Bus or lorry station seller', photo: null }
  b.use = { reason: 'Waist pain', dose: 'Half a cup daily', startDate: daysAgo(12).slice(0, 10), stillTaking: 'no' }
  b.reaction = { description: 'Customer came back with yellow eyes and dark urine after about a week. I told him to go to the hospital.', voiceNote: null, symptoms: ['Yellow eyes or skin', 'Dark or little urine'], onsetDate: daysAgo(5).slice(0, 10), outcome: 'not_recovered', warningSigns: ['Yellow eyes or skin'] }
  b.other = { medicines: 'Blood pressure tablets, name not known', conditions: 'High blood pressure' }
  b.review.followUps = [{ at: daysAgo(1), from: 'reviewer', text: 'Thank you. Can you tell us the name of the hospital he went to?' }]

  const c = emptyReport()
  Object.assign(c, { id: 'HS-DEMO-03', createdAt: daysAgo(9), status: 'sent_to_fda', sample: true, consent: true })
  c.reporter = { role: 'clinician', name: 'Sample pharmacist C', phone: '027 000 0003', town: 'Accra', facility: 'Example Polyclinic' }
  c.patient = { ageGroup: '18_44', sex: 'male', pregnant: false }
  c.product = { productId: 'p3', name: 'Sample Vitality Capsules', manufacturer: 'Demo Herbal Works, Accra', fdaNumber: 'SAMPLE-HM-0003', batch: 'VC-118', boughtFrom: 'Online or social media', photo: null }
  c.use = { reason: 'Sexual weakness', dose: 'Two capsules once', startDate: daysAgo(11).slice(0, 10), stillTaking: 'no' }
  c.reaction = { description: 'Severe headache, flushing and fast heartbeat within one hour of the first dose. Seen at the outpatient department.', voiceNote: null, symptoms: ['Headache', 'Fast heartbeat'], onsetDate: daysAgo(11).slice(0, 10), outcome: 'recovered', warningSigns: [] }
  c.other = { medicines: 'Amlodipine 10 mg daily', conditions: 'Hypertension' }
  c.review = { transcript: '', serious: 'no', causality: 'probable', notes: 'Pattern fits an undeclared PDE-5 inhibitor. Sample requested for laboratory testing.', followUps: [] }

  const d = emptyReport('suspicious')
  Object.assign(d, { id: 'HS-DEMO-04', createdAt: daysAgo(4), status: 'received', sample: true, consent: true })
  d.reporter = { role: 'self', name: '', phone: '', town: 'Kumasi', facility: '' }
  d.product.name = 'Mixture advertised as curing "all sickness"'
  d.suspicious = { issue: 'Advert makes claims that sound false or dangerous', details: 'A van with loudspeakers says the mixture cures diabetes and stroke in seven days.', whereSeen: 'Market, Kumasi' }

  return [a, b, c, d]
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return SAMPLE_PRODUCTS.filter((p) => [p.name, p.manufacturer, p.fdaNumber, p.indication].some((t) => t.toLowerCase().includes(q)))
}
