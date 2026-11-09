// No 0/O or 1/I, so a code read out over the phone is not misheard.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function newTrackingCode(random: () => number = Math.random): string {
  let body = ''
  for (let i = 0; i < 6; i++) body += ALPHABET[Math.floor(random() * ALPHABET.length)]
  return `HS-${body.slice(0, 3)}-${body.slice(3)}`
}
