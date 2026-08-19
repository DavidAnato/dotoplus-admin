/** Avatar circulaire - photo ou fallback premium (dégradé + initiales). */
export function Avatar({
  src,
  name,
  size = 36,
  ring = true,
}: {
  src?: string | null;
  name?: string;
  size?: number;
  ring?: boolean;
}) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length === 0
      ? "?"
      : parts.length === 1
        ? parts[0].slice(0, 2).toUpperCase()
        : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();

  const ringStyle = ring
    ? {
        boxShadow: `0 0 0 ${Math.max(1.5, size * 0.04)}px rgba(62, 130, 149, 0.35)`,
      }
    : {};

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Photo"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          ...ringStyle,
        }}
      />
    );
  }
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #1E3755 0%, #2A5470 48%, #3E8295 100%)",
        color: "#fff",
        fontWeight: 800,
        fontSize: Math.max(11, size * 0.32),
        letterSpacing: 0.02,
        flexShrink: 0,
        ...ringStyle,
      }}
    >
      {initials}
    </span>
  );
}
