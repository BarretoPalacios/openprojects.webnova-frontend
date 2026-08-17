const LABELS = {
  pending: "Pendiente",
  active: "Activo",
  inactive: "Inactivo",
  rejected: "Rechazado",
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status] ?? status}</span>;
}