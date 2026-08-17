import { useCallback, useEffect, useState } from "react";
import { LogOut, Eye } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ProjectDetailModal from "../components/ProjectDetailModal";
import { approveProject, deactivateProject, listAllProjects, listPendingProjects, rejectProject } from "../api/admin";
import { useToast } from "../components/Toast";
import { STATUSES } from "../lib/validation";

const FILTERS = [{ key: "all", label: "Todos" }, ...STATUSES.map((s) => ({ key: s, label: s }))];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const showToast = useToast();

  async function handleLogin(e) {
    e.preventDefault();
    setChecking(true);
    setLoginError(null);
    try {
      await listPendingProjects(tokenInput);
      setAdminToken(tokenInput);
      setAuthed(true);
    } catch (err) {
      if (err.status === 401) setLoginError("No autorizado. Token inválido.");
      else setLoginError("No se pudo conectar al panel. Verifica que el backend esté corriendo.");
    } finally {
      setChecking(false);
    }
  }

  function handleLogout() {
    setAdminToken("");
    setAuthed(false);
    setProjects([]);
    setTokenInput("");
    setSelectedId(null);
  }

  const fetchAll = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listAllProjects(adminToken);
      setProjects(data);
    } catch (err) {
      setLoadError(err);
      if (err.status === 401) {
        showToast("Sesión expirada. Ingresa el token nuevamente.", "error");
        setAdminToken("");
        setAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  }, [adminToken, showToast]);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed, fetchAll]);

  async function runAction(action, id) {
    setBusyId(id);
    try {
      const updated = await action(adminToken, id);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast("Proyecto actualizado.", "success");
    } catch (err) {
      if (err.status === 401) {
        showToast("No autorizado.", "error");
        setAdminToken("");
        setAuthed(false);
      } else if (err.status === 404) {
        showToast("Proyecto no encontrado.", "error");
      } else {
        showToast("Error al actualizar el proyecto.", "error");
      }
    } finally {
      setBusyId(null);
    }
  }

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);
  const selectedItem = projects.find((p) => p.id === selectedId) ?? null;

  if (!authed) {
    return (
      <section className="section" style={{ maxWidth: 520 }}>
        <span className="hero-eyebrow">
          <span className="hero-pulse" />
          ZONA RESTRINGIDA
        </span>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, margin: "0 0 24px" }}>./admin-login.sh</h1>
        <div className="token-field">
          <form onSubmit={handleLogin}>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label htmlFor="adminTokenInput">
                X-Admin-Token <span className="req">requerido</span>
              </label>
              <input
                id="adminTokenInput"
                className="form-input"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="admin-token"
                autoComplete="off"
              />
              <span className="form-hint">Se mantiene solo en memoria durante esta pestaña. Nunca se guarda.</span>
            </div>
            {loginError && <div className="form-msg error">{loginError}</div>}
            <button type="submit" className="btn btn-solid" style={{ width: "100%" }} disabled={checking || !tokenInput}>
              {checking ? <span className="spinner spinner-invert" /> : "Entrar al panel"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ maxWidth: 1100 }}>
      <div className="section-head">
        <div>
          <span className="section-tag">$ ./moderar-proyectos.sh</span>
          <h1 className="section-title">Revisión de proyectos</h1>
          <p className="section-sub">Aprueba, rechaza o desactiva proyectos enviados por la comunidad.</p>
        </div>
        <button type="button" className="btn btn-sm" onClick={handleLogout}>
          <LogOut />
          Salir
        </button>
      </div>

      <div className="filters-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-chip ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="results-meta">
        {filtered.length} proyecto(s) {filter !== "all" && `en estado ${filter}`}
      </p>

      {loading && (
        <div className="empty-state" style={{ opacity: 1 }}>
          <span className="spinner" />
          <p>Cargando proyectos…</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="empty-state" style={{ opacity: 1 }}>
          <p>No se pudo cargar la lista.</p>
          <button type="button" className="btn btn-sm" style={{ marginTop: 16 }} onClick={fetchAll}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !loadError && filtered.length === 0 && (
        <div className="empty-state">
          <p>No hay proyectos en este estado.</p>
        </div>
      )}

      {!loading && !loadError && filtered.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ícono</th>
                <th>Proyecto</th>
                <th>Estado</th>
                <th>Likes</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id}>
                  <td>
                    <span className="admin-icon">
                      {project.icon_url ? (
                        <img src={project.icon_url} alt="" />
                      ) : (
                        project.title.slice(0, 1).toUpperCase()
                      )}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-title"
                      onClick={() => setSelectedId(project.id)}
                      title="Ver detalle"
                    >
                      {project.title}
                    </button>
                    <div className="admin-cat">{project.category}</div>
                  </td>
                  <td>
                    <StatusBadge status={project.status} />
                  </td>
                  <td>
                    <span className="admin-num">{project.likes_count}</span>
                  </td>
                  <td>
                    <span className="admin-date">{formatDate(project.created_at)}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => setSelectedId(project.id)}
                        disabled={busyId === project.id}
                        title="Ver detalle"
                      >
                        <Eye />
                      </button>
                      {project.status !== "active" && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-approve"
                          onClick={() => runAction(approveProject, project.id)}
                          disabled={busyId === project.id}
                        >
                          Aprobar
                        </button>
                      )}
                      {project.status !== "rejected" && (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => runAction(rejectProject, project.id)}
                          disabled={busyId === project.id}
                        >
                          Rechazar
                        </button>
                      )}
                      {project.status === "active" && (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => runAction(deactivateProject, project.id)}
                          disabled={busyId === project.id}
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <ProjectDetailModal
          project={{ ...selectedItem, displayScore: selectedItem.likes_count, pending: 0 }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}