type Props = { label: string; tone: "positive" | "warning" | "danger" | "info" };

export function StatusBadge({ label, tone }: Props) {
  return <span className={`status-badge ${tone}`}><span aria-hidden="true" />{label}</span>;
}
