import { get, set } from 'idb-keyval'
import { sampleReports } from './seed'
import type { Report } from './types'

// Prototype storage: everything stays in this browser (IndexedDB). Nothing is sent anywhere.
const KEY = 'herbsafe.reports.v1'

export async function loadReports(): Promise<Report[]> {
  const existing = await get<Report[]>(KEY)
  if (existing) return existing
  const seeded = sampleReports()
  await set(KEY, seeded)
  return seeded
}

export async function saveReport(report: Report): Promise<void> {
  const all = await loadReports()
  const i = all.findIndex((r) => r.id === report.id)
  if (i >= 0) all[i] = report
  else all.unshift(report)
  await set(KEY, all)
}

export async function findReport(id: string): Promise<Report | undefined> {
  const wanted = id.trim().toUpperCase()
  return (await loadReports()).find((r) => r.id.toUpperCase() === wanted)
}

export async function resetDemo(): Promise<void> {
  await set(KEY, sampleReports())
}
