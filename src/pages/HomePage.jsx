import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useProjectsRanking } from "../hooks/useProjectsRanking";
import { useTypewriter } from "../hooks/useTypewriter";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { formatNumber } from "../hooks/useCountUp";
import ProjectCard from "../components/ProjectCard";
import ProjectDetailModal from "../components/ProjectDetailModal";
import Footer from "../components/Footer";
import { useToast } from "../components/Toast";

const TYPED_LINES = [
  "> Descubre SaaS, Open Source y herramientas hechas por developers reales.",
  "> Dale like sin registrarte. Cada like decide qué sube en el ranking.",
  "> Publica tu proyecto con tu token de comunidad.",
];

function StatValue({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const animatedOnce = useRef(false);

  useEffect(() => {
    if (value > 0 && !animatedOnce.current) {
      animatedOnce.current = true;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setDisplay(value);
        return;
      }
      const start = performance.now();
      const to = value;
      let raf;
      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(to * eased));
        if (progress < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    setDisplay(value);
  }, [value, duration]);

  return formatNumber(display);
}

function StatBox({ cmd, path, label, value, live }) {
  return (
    <div className="term">
      <div className="term-bar">
        <div className="term-dots">
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-dot" />
        </div>
        <span className="term-path">{path}.sh</span>
      </div>
      <div className="term-body">
        <div className="stat-cmd">$ {cmd}</div>
        <div className="stat-num">
          <StatValue value={value} />
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const showToast = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const typed = useTypewriter(TYPED_LINES);

  const { projects, scores, loading, loadError, reload, refresh, like, connectionState } = useProjectsRanking({
    onRateLimit: () => showToast("Vas muy rápido, espera un momento.", "error"),
    onNetworkError: () => showToast("Sin conexión, reintentando…", "error"),
    onNotFound: () => {
      showToast("Proyecto no encontrado.", "error");
      refresh();
    },
  });

  useRefreshOnFocus(refresh);

  const stats = useMemo(() => {
    const categories = new Set(projects.map((p) => p.category).filter(Boolean));
    const totalLikes = projects.reduce((sum, p) => sum + (scores[p.id]?.serverScore ?? p.likes_count ?? 0), 0);
    return { totalLikes, totalProjects: projects.length, totalCategories: categories.size };
  }, [projects, scores]);

  const topProjects = useMemo(() => {
    return projects
      .map((p) => ({ p, score: scores[p.id]?.displayScore ?? p.likes_count ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ p, score }) => p);
  }, [projects, scores]);

  const openProject = useCallback((id) => setSelectedId(id), []);

  const selectedItem = projects.find((p) => p.id === selectedId) ?? null;
  const selectedScore = selectedItem ? scores[selectedItem.id] : undefined;

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <span className="hero-pulse" />
            ACCESO LIBRE — SIN REGISTRO PARA VOTAR
          </span>
          <h1>
            El directorio
            <br />
            de software que
            <br />
            construye la comunidad.
          </h1>
          <div className="hero-typed-wrap">
            <span>{typed}</span>
            <span className="hero-cursor" />
          </div>
          <div className="hero-ctas">
            <Link to="/proyectos" className="btn btn-solid">
              Explorar proyectos
            </Link>
            <Link to="/enviar-proyecto" className="btn">
              Publicar tu proyecto
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "56px 0 10px" }}>
        <div className="stats-grid">
          <StatBox
            cmd="curl /api/projects | jq '.[].likes_count' | sum"
            path="~/stats/likes.total"
            label="Likes emitidos en total"
            value={stats.totalLikes}
          />
          <StatBox
            cmd="curl /api/projects | jq 'length'"
            path="~/stats/projects.len"
            label="Proyectos publicados"
            value={stats.totalProjects}
          />
          <StatBox
            cmd="curl /api/projects | jq '[.[].category] | unique | length'"
            path="~/stats/categories.uniq"
            label="Categorías activas"
            value={stats.totalCategories}
          />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-tag">$ sort --by=likes --desc</span>
            <h2 className="section-title">Lo más destacado ahora</h2>
            <p className="section-sub">
              Ordenado dinámicamente por likes de la comunidad. Sin cuenta, sin fricción: cada like cuenta al instante.
            </p>
          </div>
          <Link to="/proyectos" className="btn btn-sm">
            Ver todos →
          </Link>
        </div>

        {loading && (
          <div className="empty-state" style={{ opacity: 1 }}>
            <span className="spinner" />
            <p>Cargando proyectos…</p>
          </div>
        )}

        {!loading && loadError && (
          <div className="empty-state" style={{ opacity: 1 }}>
            <p>No se pudo cargar el catálogo. ¿Está corriendo el backend?</p>
            <button type="button" className="btn btn-sm" style={{ marginTop: 16 }} onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !loadError && topProjects.length === 0 && (
          <div className="empty-state">
            <p>Todavía no hay proyectos publicados.</p>
          </div>
        )}

        {!loading && !loadError && topProjects.length > 0 && (
          <div className="projects-grid">
            {topProjects.map((project, index) => {
              const score = scores[project.id];
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  rank={index + 1}
                  score={score?.displayScore ?? project.likes_count ?? 0}
                  pending={score?.pending ?? 0}
                  flushing={score?.flushing ?? false}
                  onOpen={openProject}
                  onLike={like}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="term">
          <div className="term-bar">
            <div className="term-dots">
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="term-dot" />
            </div>
            <span className="term-path">~/webnova/publicar.sh</span>
          </div>
          <div className="term-body cta-row">
            <div style={{ maxWidth: 560 }}>
              <h3 style={{ margin: 0, marginBottom: 8, fontSize: "1.2rem" }}>¿Construiste algo? Publícalo en Webnova.</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: ".88rem" }}>
                La publicación se hace con un formulario y requiere tu token de comunidad. Si aún no eres miembro,
                entérate cómo obtenerlo.
              </p>
            </div>
            <Link to="/enviar-proyecto" className="btn btn-solid">
              Publicar proyecto →
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {selectedItem && (
        <ProjectDetailModal
          project={{
            ...selectedItem,
            displayScore: selectedScore?.displayScore ?? selectedItem.likes_count ?? 0,
            pending: selectedScore?.pending ?? 0,
            flushing: selectedScore?.flushing ?? false,
          }}
          onClose={() => setSelectedId(null)}
          onLike={like}
        />
      )}
    </>
  );
}