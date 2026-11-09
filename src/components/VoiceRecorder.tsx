import { useEffect, useRef, useState } from 'react'
import type { VoiceNote } from '../lib/types'
import { Button } from './ui'

const MAX_SECONDS = 120

function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/** Record, play back, replace or delete one voice note of up to two minutes. */
export default function VoiceRecorder({ value, onChange }: { value: VoiceNote | null; onChange: (note: VoiceNote | null) => void }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const recorder = useRef<MediaRecorder | null>(null)
  const startedAt = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  const supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  function stop() {
    window.clearInterval(timer.current)
    if (recorder.current?.state === 'recording') recorder.current.stop()
  }

  useEffect(() => stop, [])

  async function start() {
    setError('')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('We could not use the microphone. Allow microphone access in your browser, or type your story below.')
      return
    }
    const chunks: Blob[] = []
    const rec = new MediaRecorder(stream)
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      setRecording(false)
      const length = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' })
      onChange({ dataUrl: await blobToDataUrl(blob), mime: blob.type, seconds: length })
    }
    recorder.current = rec
    startedAt.current = Date.now()
    setSeconds(0)
    setRecording(true)
    rec.start()
    timer.current = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt.current) / 1000
      setSeconds(elapsed)
      if (elapsed >= MAX_SECONDS) stop()
    }, 250)
  }

  if (!supported) {
    return <p className="rounded-xl bg-stone-100 p-3 text-stone-700">Voice notes are not available in this browser. Please type what happened below.</p>
  }

  return (
    <div className="rounded-2xl border border-stone-300 bg-white p-4">
      {recording ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-lg font-bold text-red-700" aria-live="polite">
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-600" />
            Recording {clock(seconds)}
          </span>
          <Button onClick={stop} className="bg-red-700 hover:bg-red-800">
            Stop
          </Button>
          <span className="text-sm text-stone-600">Stops by itself at {clock(MAX_SECONDS)}.</span>
        </div>
      ) : value ? (
        <div className="space-y-3">
          <p className="font-semibold text-leaf-900">Voice note saved ({clock(value.seconds)})</p>
          <audio controls src={value.dataUrl} className="w-full" />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={start}>
              Record again
            </Button>
            <Button variant="danger" onClick={() => onChange(null)}>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={start}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1A7 7 0 0 0 19 12h-2z" />
            </svg>
            Record a voice note
          </Button>
          <span className="text-sm text-stone-600">Up to 2 minutes. Speak in the language you are most comfortable with.</span>
        </div>
      )}
      {error && <p className="mt-3 text-red-700">{error}</p>}
    </div>
  )
}
