import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FlaskConical,
  Lightbulb,
  MapPin,
  Stethoscope,
} from 'lucide-react'

const SEVERITY = {
  low:      { label: 'Leve',     cls: 'bg-green-100 text-green-700 border-green-200' },
  moderate: { label: 'Moderado', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  high:     { label: 'Alto',     cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  critical: { label: 'Crítico',  cls: 'bg-red-100 text-red-700 border-red-200' },
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY[severity] ?? SEVERITY.low
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Icon size={15} className="text-sky-600 shrink-0" />
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}

export default function ReportViewer({ report }) {
  return (
    <div className="space-y-3">
      {report.requires_urgent_attention && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-red-700 text-sm">Atención urgente requerida</p>
            <p className="text-red-600 text-xs mt-0.5">
              Este análisis requiere evaluación médica inmediata.
            </p>
          </div>
        </div>
      )}

      <Card icon={FileText} title="Resumen clínico">
        <p className="text-sm text-slate-600 leading-relaxed">{report.summary}</p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>ID: <code className="font-mono">{report.report_id.slice(0, 8)}</code></span>
          <span className="capitalize">{report.analysis_type}</span>
          <span>{new Date(report.timestamp).toLocaleString('es-ES')}</span>
        </div>
      </Card>

      {report.findings.length > 0 && (
        <Card icon={Stethoscope} title={`Hallazgos (${report.findings.length})`}>
          <ul className="space-y-2.5">
            {report.findings.map((f, i) => (
              <li key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm text-slate-700 font-medium leading-snug">{f.description}</p>
                  <SeverityBadge severity={f.severity} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                  {f.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {f.location}
                    </span>
                  )}
                  <span>Confianza: {Math.round(f.confidence * 100)}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {report.recommendations.length > 0 && (
        <Card icon={Lightbulb} title="Recomendaciones">
          <ul className="space-y-2">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {report.differential_diagnosis.length > 0 && (
        <Card icon={FlaskConical} title="Diagnóstico diferencial">
          <div className="flex flex-wrap gap-2">
            {report.differential_diagnosis.map((d, i) => (
              <span key={i} className="bg-slate-50 text-slate-600 text-xs px-3 py-1 rounded-full border border-slate-200">
                {d}
              </span>
            ))}
          </div>
        </Card>
      )}

      <p className="text-xs text-slate-400 text-center px-2 pb-1 leading-relaxed">
        {report.disclaimer}
      </p>
    </div>
  )
}
