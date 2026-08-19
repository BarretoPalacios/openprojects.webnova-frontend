import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProjectsRanking } from "../hooks/useProjectsRanking";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { CATEGORIES } from "../lib/validation";
import ProjectCard from "../components/ProjectCard";
import ProjectDetailModal from "../components/ProjectDetailModal";
import Footer from "../components/Footer";
import { useToast } from "../components/Toast";

const CATEGORY_LABELS = {
  saas: "SaaS",
  tool: "Herramienta",
  api: "API",
  extension: "Extensión",
  mobile_app: "App móvil",
  other: "Otro",
};

export default function ProjectsPage() {
  const showToast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const { projects, scores, loading, loadError, reload, refresh, like } = useProjectsRanking({
    onRateLimit: () => showToast("Vas muy rápido, espera un momento.", "error"),
    onNetworkError: () => showToast("Sin conexión, reintentando…", "error"),
    onNotFound: () => {
      showToast("Proyecto no encontrado.", "error");
      refresh();
    },
  });

  useRefreshOnFocus(refresh);

  const openProject = useCallback((id) => setSelectedId(id), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (
        q &&
        !`${p.title} ${p.description} ${p.objectives || ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    return list.sort(
      (a, b) =>
        (scores[b.id]?.displayScore ?? b.likes_count ?? 0) -
        (scores[a.id]?.displayScore ?? a.likes_count ?? 0)
    );
  }, [projects, scores, query, category]);

  const selectedItem = projects.find((p) => p.id === selectedId) ?? null;
  const selectedScore = selectedItem ? scores[selectedItem.id] : undefined;

  return (
    <>
      <section className="hero" style={{ padding: "60px 20px 40px" }}>
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <span className="hero-pulse" />
            DIRECTORIO COMPLETO
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem,4.5vw,3rem)" }}>
            grep -r "tu próxima
            <br />
            herramienta favorita"
          </h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 44 }}>
        <div className="search-bar">
          <Search />
          <input
            type="search"
            placeholder="grep -i 'buscar por nombre o descripción...'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <button
            type="button"
            className={`filter-chip ${category === "all" ? "active" : ""}`}
            onClick={() => setCategory("all")}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <p className="results-meta">
          $ {filtered.length} proyecto{filtered.length === 1 ? "" : "s"} encontrado
          {filtered.length === 1 ? "" : "s"}
        </p>

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

        {!loading && !loadError && filtered.length === 0 && (
          <div className="empty-state">
            <p style={{ margin: 0, marginBottom: 6 }}>$ sin resultados para tu búsqueda</p>
            <p style={{ margin: 0, opacity: 0.7, fontSize: ".8rem" }}>
              Prueba con otro término o quita algún filtro de categoría.
            </p>
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="projects-grid">
            {filtered.map((project) => {
              const score = scores[project.id];
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  score={score?.displayScore ?? project.likes_count ?? 0}
                  pending={score?.pending ?? 0}
                  flushing={score?.flushing ?? false}
                  liked={score?.liked ?? false}
                  onOpen={openProject}
                  onLike={like}
                />
              );
            })}
          </div>
        )}
      </section>

      <Footer right="Datos servidos desde /api/projects + stream en vivo /api/stream." />

      {selectedItem && (
        <ProjectDetailModal
          project={{
            ...selectedItem,
            displayScore: selectedScore?.displayScore ?? selectedItem.likes_count ?? 0,
            pending: selectedScore?.pending ?? 0,
            flushing: selectedScore?.flushing ?? false,
            liked: selectedScore?.liked ?? false,
          }}
          onClose={() => setSelectedId(null)}
          onLike={like}
        />
      )}
    </>
  );
}