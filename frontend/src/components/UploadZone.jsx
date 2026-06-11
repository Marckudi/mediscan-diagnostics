import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

export default function UploadZone({ onFile, preview }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) onFile(f)
    },
    [onFile]
  )

  const handleChange = (e) => {
    const f = e.target.files[0]
    if (f) onFile(f)
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
        ${dragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-400'}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Preview" className="w-full h-64 object-contain bg-slate-900 p-2" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
              Haz clic para cambiar
            </span>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center select-none">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Arrastra tu imagen aquí</p>
          <p className="text-slate-400 text-sm mt-1">o haz clic para seleccionar</p>
          <p className="text-slate-300 text-xs mt-3">JPG · PNG · WebP · GIF — máx. 10 MB</p>
        </div>
      )}
    </div>
  )
}
