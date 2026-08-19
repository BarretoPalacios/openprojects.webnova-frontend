import { memo, useEffect, useRef } from "react";
import { ExternalLink, Play } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import SocialIcon from "./SocialIcon";
import LikeButton from "./LikeButton";

function ProjectCard({ project, rank, score, pending, flushing, liked, onOpen, onLike }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      el.classList.add("in-view");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const title = project.title || "Sin título";
  const description = project.description || "";
  const firstImage = project.images && project.images.length ? project.images[0] : "";
  const shotText = `${(title || "PROYECTO").slice(0, 12).toUpperCase()}.PNG`;
  const github = project.author && project.author.github;

  return (
    <article className="term card" ref={ref}>
      <div className="term-bar">
        <div className="term-dots">
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-dot" />
        </div>
        <span className="term-path">~/proyectos/{project.id}.sh</span>
      </div>
      <div className="term-body card-body">
        {rank && <span className="card-rank">#{String(rank).padStart(2, "0")} EN TENDENCIA</span>}
        <div className="card-top">
          <div className="card-logo">
            {project.icon_url ? (
              <img src={project.icon_url} alt={`Ícono de ${title}`} loading="lazy" />
            ) : (
              title.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <button type="button" className="card-name-link" onClick={() => onOpen(project.id)}>
              {title}
            </button>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <CategoryBadge category={project.category} />
            </div>
          </div>
        </div>
        <p className="card-tagline">
          {description.length > 120 ? `${description.slice(0, 119)}…` : description}
        </p>
        <button type="button" className="card-shot" onClick={() => onOpen(project.id)} aria-label={`Ver detalle de ${title}`}>
          {firstImage ? <img src={firstImage} alt="" loading="lazy" /> : <span>{shotText}</span>}
        </button>
        <div className="card-links">
          <a
            className="icon-link"
            href={project.website_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            title="Sitio web"
            aria-label={`Sitio web de ${title}`}
          >
            <ExternalLink />
          </a>
          {project.demo_video_url && (
            <a
              className="icon-link"
              href={project.demo_video_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver demo"
              aria-label={`Demo de ${title}`}
            >
              <Play />
            </a>
          )}
          {github && (
            <a
              className="icon-link"
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              aria-label={`GitHub de ${title}`}
            >
              <SocialIcon name="github" size={15} />
            </a>
          )}
        </div>
        <div className="card-foot">
          <LikeButton
            count={score}
            active={pending > 0}
            flushing={flushing}
            liked={liked}
            onLike={() => onLike(project.id)}
          />
        </div>
      </div>
    </article>
  );
}

export default memo(ProjectCard);