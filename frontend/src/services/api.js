const BASE = '/api/v1'

export async function analyzeImage({ file, analysisType, clinicalContext, patientAge, patientSex }) {
  const form = new FormData()
  form.append('file', file)
  form.append('analysis_type', analysisType)
  if (clinicalContext) form.append('clinical_context', clinicalContext)
  if (patientAge)      form.append('patient_age', String(patientAge))
  if (patientSex)      form.append('patient_sex', patientSex)

  const res = await fetch(`${BASE}/analysis/`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? 'Error en el análisis')
  return data
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/analysis/health`)
  return res.json()
}
