import { Button } from './ui'

/** Shrinks a phone photo to at most 1000px so it stores and uploads quickly on a slow connection. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.8)
}

export default function PhotoInput({ value, onChange }: { value: string | null; onChange: (photo: string | null) => void }) {
  return (
    <div>
      {value ? (
        <div className="flex flex-wrap items-end gap-3">
          <img src={value} alt="Product you photographed" className="h-32 w-32 rounded-md border border-line object-cover" />
          <Button variant="danger" onClick={() => onChange(null)}>
            Remove photo
          </Button>
        </div>
      ) : (
        <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-ink bg-paper px-5 text-base font-bold hover:bg-wash">
          Take or choose a photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) onChange(await shrink(file))
            }}
          />
        </label>
      )}
    </div>
  )
}
