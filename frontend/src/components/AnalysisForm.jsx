import { Microscope } from 'lucide-react'

const ANALYSIS_TYPES = [
  { value: 'general',       label: 'General' },
  { value: 'radiology',     label: 'Radiología' },
  { value: 'pathology',     label: 'Patología' },
  { value: 'dermatology',   label: 'Dermatología' },
  { value: 'ophthalmology', label: 'Oftalmología' },
]

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition'

export default function AnalysisForm({ form, onChange, onSubmit, loading, hasFile }) {
  const set = (key) => (e) => onChange({ ...form, [key]: e.target.value })

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
        Parámetros del análisis
      </h2>

      <div>
        <label className="block text-sm text-slate-600 mb-1.5 font-medium">Tipo de análisis</label>
        <select value={form.analysisType} onChange={set('analysisType')} className={inputCls}>
          {ANALYSIS_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1.5 font-medium">
          Contexto clínico
          <span className="text-slate-400 font-normal ml-1">(opcional)</span>
        </label>
        <textarea
          value={form.clinicalContext}
          onChange={set('clinicalContext')}
          rows={3}
          placeholder="Síntomas, antecedentes, motivo de consulta..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1.5 font-medium">Edad</label>
          <input
            type="number" min={0} max={150}
            value={form.patientAge}
            onChange={set('patientAge')}
            placeholder="años"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5 font-medium">Sexo</label>
          <select value={form.patientSex} onChange={set('patientSex')} className={inputCls}>
            <option value="">No especificado</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!hasFile || loading}
        className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-400
                   text-white font-semibold py-2.5 rounded-lg transition-colors
                   flex items-center justify-center gap-2 text-sm shadow-sm"
      >
        <Microscope size={15} />
        {loading ? 'Analizando...' : 'Analizar imagen'}
      </button>
    </form>
  )
}
