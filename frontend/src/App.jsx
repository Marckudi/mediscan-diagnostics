import { useCallback, useEffect, useState } from 'react'
import { Activity, Stethoscope, WifiOff } from 'lucide-react'
import UploadZone from './components/UploadZone'
import AnalysisForm from './components/AnalysisForm'
import ReportViewer from './components/ReportViewer'
import { analyzeImage, checkHealth } from './services/api'

export default function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    analysisType: 'general',
    clinicalContext: '',
    patientAge: '',
    patientSex: '',
  })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiOnline, setApiOnline] = useState(null)

  useEffect(() => {
    checkHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  const handleFile = useCallback((f) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setReport(null)
    setError(null)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const result = await analyzeImage({ file, ...form })
      setReport(result.report)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-sky-600 text-white p-2 rounded-lg shadow-sm">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">MediScan Diagnostics</h1>
            <p className="text-xs text-slate-400 mt-0.5">Análisis de imágenes médicas por IA</p>
          </div>
          <div className="ml-auto">
            {apiOnline === null && <span className="text-xs text-slate-400">Conectando...</span>}
            {apiOnline === true && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <Activity size={11} />
                API activa
              </span>
            )}
            {apiOnline === false && (
              <span className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                <WifiOff size={11} />
                API no disponible
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <UploadZone onFile={handleFile} preview={preview} />
            <AnalysisForm form={form} onChange={setForm} onSubmit={handleSubmit} loading={loading} hasFile={!!file} />
          </div>
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            {loading && (
              <div className="bg-white rounded-xl border border-slate-200 p-14 text-center shadow-sm">
                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Analizando imagen...</p>
                <p className="text-slate-400 text-sm mt-1">El agente de IA está procesando</p>
              </div>
            )}
            {report && !loading && <ReportViewer report={report} />}
            {!report && !loading && !error && (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-14 text-center">
                <Stethoscope size={42} className="mx-auto mb-3 text-slate-200" />
                <p className="text-slate-400 text-sm">El informe aparecerá aquí tras el análisis</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        MediScan Diagnostics — Uso exclusivo de apoyo clínico. No reemplaza al médico.
      </footer>
    </div>
  )
}
