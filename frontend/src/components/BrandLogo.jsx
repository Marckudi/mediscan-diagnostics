export default function BrandLogo({ size = 36, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="MediScan logo"
      >
        <defs>
          <linearGradient id="ms-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#ms-grad)" />
        <polyline
          points="5,32 17,32 20,21 23,43 26,28 29,37 32,32 59,32"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="32" r="3" fill="white" opacity="0.9" />
      </svg>

      {showText && (
        <div>
          <p className="text-[1.1rem] font-bold leading-none tracking-tight">
            <span className="text-sky-600">Medi</span>
            <span className="text-indigo-600">Scan</span>
          </p>
          <p className="text-[0.65rem] text-slate-400 tracking-widest uppercase mt-0.5 font-medium">
            Diagnostics
          </p>
        </div>
      )}
    </div>
  )
}
