import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu } from "lucide-react";

const LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/proyectos", label: "Proyectos", end: false },
  { to: "/comunidad", label: "Comunidad", end: false },
  { to: "/enviar-proyecto", label: "+ Publicar", end: false },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-wnv">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          OPENPROJECTS.WEBNOVA<span className="nav-cursor" />
        </Link>
        <button type="button" className="btn-mobile-toggle" onClick={() => setOpen((o) => !o)}>
          <Menu />
          Menú
        </button>
        <nav className={`nav-links ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
