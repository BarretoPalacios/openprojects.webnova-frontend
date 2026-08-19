import { useEffect, useState } from "react";
import { X, ExternalLink, Play } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import SocialIcon from "./SocialIcon";
import LikeButton from "./LikeButton";

function youtubeEmbed(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {
    return null;
  }
  return null;
}

const SOCIAL_KEYS = ["github", "website", "tiktok", "instagram", "facebook", "x", "email"];

export default function ProjectDetailModal({ project, onClose, onLike }) {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null);
        else onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, onClose]);

  const author = project.author ?? {};
  const images = project.images ?? [];
  const embed = project.demo_video_url ? youtubeEmbed(project.demo_video_url) : null;
  const socialLinks = SOCIAL_KEYS.filter((key) => author[key]);

  return (
    <>
      <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box wide">
          <div className="term">
            <div className="term-bar">
              <div className="term-dots">
                <span className="term-dot" />
                <span className="term-dot" />
                <span className="term-dot" />
              </div>
              <span className="term-path">detalle/{project.title.toLowerCase().replace(/\s+/g, "-")}.sh</span>
              <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
                <X />
              </button>
            </div>
            <div className="term-body">
              <div className="detail-head">
                <div className="detail-icon">
                  {project.icon_url ? (
                    <img src={project.icon_url} alt={`Ícono de ${project.title}`} />
                  ) : (
                    project.title.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="section-title" style={{ marginBottom: 6 }}>
                    {project.title}
                  </h2>
                  <CategoryBadge category={project.category} />
                </div>
                {onLike && (
                  <div className="detail-actions">
                    <LikeButton
                      count={project.displayScore ?? project.likes_count ?? 0}
                      active={(project.pending ?? 0) > 0}
                      flushing={project.flushing}
                      onLike={() => onLike(project.id)}
                    />
                    {project.website_url && (
                      <a
                        className="btn btn-sm"
                        href={project.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ margin: 0 }}
                      >
                        <ExternalLink />
                        Visitar sitio
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="card-links" style={{ marginTop: 16 }}>
                {project.website_url && (
                  <a
                    className="icon-link icon-link-lg"
                    href={project.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Sitio web"
                  >
                    <ExternalLink />
                  </a>
                )}
                {socialLinks.map((key) => (
                  <a
                    key={key}
                    className="icon-link icon-link-lg"
                    href={author[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={key}
                  >
                    <SocialIcon name={key} size={18} />
                  </a>
                ))}
              </div>

              <p style={{ opacity: 0.9, fontSize: ".9rem", margin: "16px 0" }}>{project.description}</p>

              <h4 style={{ fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.7 }}>
                Objetivos
              </h4>
              <p style={{ opacity: 0.85, fontSize: ".85rem" }}>{project.objectives}</p>

              {embed && (
                <div className="detail-video" style={{ marginTop: 20 }}>
                  <iframe
                    src={embed}
                    title={`Demo de ${project.title}`}
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              )}

              {images.length > 0 && (
                <div className="detail-gallery">
                  {images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      className="gallery-item"
                      onClick={() => setLightbox(img)}
                      aria-label={`Ampliar imagen ${i + 1}`}
                    >
                      <img src={img} alt={`Captura ${i + 1} de ${project.title}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {project.demo_video_url && !embed && (
                <a
                  className="btn btn-sm"
                  style={{ marginTop: 20 }}
                  href={project.demo_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play />
                  Ver demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setLightbox(null)}>
          <div className="modal-box wide">
            <div className="term">
              <div className="term-bar">
                <div className="term-dots">
                  <span className="term-dot" />
                  <span className="term-dot" />
                  <span className="term-dot" />
                </div>
                <span className="term-path">preview.img</span>
                <button type="button" className="modal-close" onClick={() => setLightbox(null)} aria-label="Cerrar">
                  <X />
                </button>
              </div>
              <img src={lightbox} alt="" style={{ display: "block", width: "100%" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}