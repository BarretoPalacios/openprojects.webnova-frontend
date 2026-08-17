export function formatNumber(n) {
  return new Intl.NumberFormat("es-PE").format(Math.max(0, Number(n) || 0));
}