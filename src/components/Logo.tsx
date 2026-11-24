export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#1B2333" />
        <g fill="#3D4860">
          <rect x="6" y="6" width="6" height="6" rx="1.5" />
          <rect x="13" y="6" width="6" height="6" rx="1.5" />
          <rect x="20" y="6" width="6" height="6" rx="1.5" />
          <rect x="6" y="13" width="6" height="6" rx="1.5" />
          <rect x="13" y="13" width="6" height="6" rx="1.5" />
          <rect x="6" y="20" width="6" height="6" rx="1.5" />
          <rect x="13" y="20" width="6" height="6" rx="1.5" />
          <rect x="20" y="20" width="6" height="6" rx="1.5" />
        </g>
        <rect x="20" y="13" width="6" height="6" rx="1.5" fill="#FFD84D" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">Tidyset</span>
    </div>
  );
}
