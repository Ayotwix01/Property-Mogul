export function BrandLogo({ size = 36, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brand-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#brand-logo-grad)" />
      <path
        d="M14 30 L32 15 L50 30 V49 A2 2 0 0 1 48 51 H37 V38 H27 V51 H16 A2 2 0 0 1 14 49 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="32" cy="15" r="2.5" fill="#ffffff" />
    </svg>
  );
}
