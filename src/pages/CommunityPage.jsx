import { Link } from "react-router";
import Footer from "../components/Footer";
import SocialIcon from "../components/SocialIcon";

const STEPS = [
  {
    title: "Únete a la comunidad",
    body: "Sigue cualquiera de mis redes (TikTok, Facebook o Instagram) y súmate al espacio de la comunidad que se enlaza en la bio.",
  },
  {
    title: "Recibe tu token ",
    body: "Cada miembro recibe un token único que lo identifica como parte de la comunidad de Webnova. No se comparte ni se revende.",
  },
  {
    title: "Completa el formulario de publicación",
    body: "Ve a Publicar proyecto y llena los datos: ícono, título, descripción, sitio web, demo, capturas y tus redes.",
  },
  {
    title: "Ingresa tu token",
    body: "El formulario valida tu token antes de aceptar la publicación. Sin un token de comunidad, el envío no se procesa.",
  },
  {
    title: "Tu proyecto entra en revisión",
    body: "En cuanto el token se valida, tu proyecto queda en estado \"pendiente\". Un administrador lo revisa y, al aprobarlo, aparece en el directorio y puede empezar a recibir likes.",
  },
];

const SOCIALS = [
  { name: "tiktok", label: "TikTok", handle: "@webn0va", href: "https://www.tiktok.com/@webn0va" },
  { name: "facebook", label: "Facebook", handle: "/webnova", href: "https://www.facebook.com/profile.php?id=61570750662082" },
  { name: "instagram", label: "Instagram", handle: "@webnova.pe", href: "https://www.instagram.com/webnova.pe/" },
];

const PROFILE_ROWS = [
  ["usuario", "Fundador & desarrollador de Webnova"],
  [
    "ocupación",
    "Desarrollador full-stack independiente. Diseño y construyo productos digitales de principio a fin: interfaz, lógica de negocio y despliegue.",
  ],
  ["enfoque", "Desarrollo a medida end to end, comunidades de software y proyectos open source."],
  [
    "filosofía",
    "Construir en público, documentar el proceso y compartirlo en video para que otros creadores encuentren su propio camino.",
  ],
];

export default function CommunityPage() {
  return (
    <>
      <section className="hero" style={{ padding: "60px 20px 40px" }}>
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <span className="hero-pulse" />
            WHOAMI
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem,4.5vw,3rem)" }}>
            La persona detrás
            <br />
            de Webnova.
          </h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="profile-grid">
          <div className="bg-white term">
            <img src="logo.png"/>
          </div>
          <div className="term">
            <div className="term-bar">
              <div className="term-dots">
                <span className="term-dot" />
                <span className="term-dot" />
                <span className="term-dot" />
              </div>
              <span className="term-path">~/creador/whoami.sh</span>
            </div>
            <div className="term-body">
              {PROFILE_ROWS.map(([key, value]) => (
                <div className="kv-row" key={key}>
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
              ))}
              <p style={{ marginTop: 18, opacity: 0.85, fontSize: ".9rem" }}>
                Creé Openprojects Webnova porque quería un espacio simple, honesto y sin fricción donde cualquier persona que apoya mis videos y se encuentra en la comunidad pudiera
                mostrar lo que construyó y dar un posible impulso a su proyecto ojo sin fines de lucro pero si gustas donarme , jeje doname !
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <span className="section-tag">$ cat redes.txt</span>
        <h2 className="section-title" style={{ marginBottom: 22 }}>
          Sígueme en redes
        </h2>
        <div className="social-grid">
          {SOCIALS.map((s) => (
            <a key={s.name} className="social-card" href={s.href} target="_blank" rel="noopener noreferrer">
              <SocialIcon name={s.name} size={24} />
              <span>
                <span className="s-name">{s.label}</span>
                <br />
                <span className="s-handle">{s.handle}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="section" id="token" style={{ paddingTop: 0 }}>
        <span className="section-tag">$ ./unirme-a-la-comunidad.sh --help</span>
        <h2 className="section-title" style={{ marginBottom: 10 }}>
          Cómo obtener tu token de comunidad
        </h2>
        <p className="section-sub" style={{ marginBottom: 30, maxWidth: 680 }}>
          Publicar en Openprojects Webnova se hace con un formulario. Pero para mantener el directorio
          con proyectos reales y evitar spam, publicar está reservado a quienes pertenecen a la comunidad y tienen un
          token válido.
        </p>

        <div className="term" style={{ marginBottom: 26 }}>
          <div className="term-bar">
            <div className="term-dots">
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="term-dot" />
            </div>
            <span className="term-path">~/comunidad/token.md</span>
          </div>
          <div className="term-body">
            <ol className="pr-steps">
              {STEPS.map((step, i) => (
                <li key={i}>
                  <strong>{step.title}</strong>
                  <p style={{ opacity: 0.8, margin: "6px 0 0", fontSize: ".85rem" }}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Link to="/enviar-proyecto" className="btn btn-solid">
          Ir al formulario de publicación
        </Link>
      </section>

      <Footer right="Publicación con token. Comunidad primero." />
    </>
  );
}
