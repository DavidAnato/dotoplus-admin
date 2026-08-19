/** Marque DOTO+ autonome : lisible sur fond clair et sombre, sans filtre CSS. */

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="DOTO+"
    >
      <rect width="64" height="64" rx="16" fill="#F4FBFC" />
      <rect x="3" y="3" width="58" height="58" rx="14" fill="#16324A" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="DM Sans, Segoe UI, Arial, sans-serif"
        fontSize="26"
        fontWeight="800"
        fill="#30B9C1"
      >
        D+
      </text>
    </svg>
  );
}

export function BrandWordmark({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <svg
      height={compact ? 18 : 22}
      viewBox="0 0 132 28"
      aria-hidden
      style={{ display: "block" }}
    >
      <text
        x="0"
        y="21"
        fontFamily="DM Sans, Segoe UI, Arial, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="currentColor"
      >
        DOTO
      </text>
      <text
        x="78"
        y="21"
        fontFamily="DM Sans, Segoe UI, Arial, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#30B9C1"
      >
        +
      </text>
    </svg>
  );
}
