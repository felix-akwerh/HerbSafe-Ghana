import { describe, expect, it } from 'vitest'
import { completeness, isValidCase, needsUrgentCare } from './completeness'
import { toCsv, toE2bDraft } from './export'
import { sampleReports } from './seed'
import { newTrackingCode } from './tracking'
import { emptyReport } from './types'

describe('tracking code', () => {
  it('has the HS-XXX-XXX shape and avoids look-alike characters', () => {
    for (let i = 0; i < 200; i++) expect(newTrackingCode()).toMatch(/^HS-[A-HJ-NP-Z2-9]{3}-[A-HJ-NP-Z2-9]{3}$/)
  })
})

describe('completeness', () => {
  it('scores an empty report 0 and not a valid case', () => {
    const r = emptyReport()
    expect(completeness(r)).toBe(0)
    expect(isValidCase(r)).toBe(false)
  })

  it('accepts a voice note alone as the description of what happened', () => {
    const r = emptyReport()
    r.reporter.phone = '020 000 0000'
    r.patient.sex = 'female'
    r.product.name = 'Some bitters'
    expect(isValidCase(r)).toBe(false)
    r.reaction.voiceNote = { dataUrl: 'data:audio/webm;base64,AA==', mime: 'audio/webm', seconds: 12 }
    expect(isValidCase(r)).toBe(true)
  })

  it('scores a fuller report higher than a thinner one', () => {
    const [full, thin] = sampleReports()
    expect(completeness(full)).toBe(100)
    expect(completeness(thin)).toBeLessThan(completeness(full))
  })

  it('flags warning signs for urgent care advice', () => {
    const [calm, yellowEyes] = sampleReports()
    expect(needsUrgentCare(calm)).toBe(false)
    expect(needsUrgentCare(yellowEyes)).toBe(true)
  })
})

describe('exports', () => {
  it('escapes XML and carries the product and outcome', () => {
    const r = sampleReports()[0]
    r.product.name = 'Bitters <A&B>'
    const out = toE2bDraft(r)
    expect(out).toContain('Bitters &lt;A&amp;B&gt;')
    expect(out).toContain('<field id="E.i.7"')
    expect(out).toContain('>2</field>')
    expect(out).not.toContain('<A&B>')
  })

  it('quotes CSV cells that contain commas', () => {
    const r = sampleReports()[0]
    r.product.name = 'Bitters, large "family" size'
    const csv = toCsv([r])
    expect(csv.split('\n')[0]).toContain('Completeness %')
    expect(csv).toContain('"Bitters, large ""family"" size"')
  })
})
