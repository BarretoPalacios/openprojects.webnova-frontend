const LABELS = {
  saas: "SaaS",
  tool: "Herramienta",
  api: "API",
  extension: "Extensión",
  mobile_app: "App móvil",
  other: "Otro",
};

export default function CategoryBadge({ category }) {
  return <span className="card-cat">{LABELS[category] ?? category}</span>;
}