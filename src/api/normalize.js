export function normalizeProject(p) {
  if (!p) return p;
  return { ...p, id: p.id ?? p._id };
}