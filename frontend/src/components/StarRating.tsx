export function StarRating({ value, compact = false, label = "Valutazione" }: { value: number; compact?: boolean; label?: string }) {
  const safeValue = Math.max(0, Math.min(5, value));
  const filled = Math.round(safeValue);
  const stars = `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;

  return <span className={`star-rating ${compact ? "compact" : ""}`} role="img" aria-label={`${label}: ${safeValue.toFixed(1)} su 5`}>
    <span aria-hidden="true">{compact ? "★" : stars}</span>
    <strong>{safeValue.toFixed(1)}<small>/5</small></strong>
  </span>;
}
