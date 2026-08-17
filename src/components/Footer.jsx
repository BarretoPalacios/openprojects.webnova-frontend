export default function Footer({ right = "Publicación validada por token de comunidad." }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>WEBNOVA_ © {new Date().getFullYear()} — Directorio comunitario de software.</span>
        <span>{right}</span>
      </div>
    </footer>
  );
}