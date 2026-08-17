import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Check, Send } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { submitProject } from "../api/projects";
import { validateProjectForm, CATEGORIES } from "../lib/validation";

const MIN_TOKEN_LENGTH = 8;

const CATEGORY_LABELS = {
  saas: "SaaS",
  tool: "Herramienta",
  api: "API",
  extension: "Extensión",
  mobile_app: "App móvil",
  other: "Otro",
};

const INITIAL_AUTHOR = { github: "", website: "", tiktok: "", instagram: "", facebook: "", x: "", email: "" };

const INITIAL = {
  title: "",
  description: "",
  objectives: "",
  category: "",
  website_url: "",
  demo_video_url: "",
  author: { ...INITIAL_AUTHOR },
};

function map422(detail) {
  const map = {};
  if (Array.isArray(detail)) {
    detail.forEach((item) => {
      const key = (item.loc ?? []).filter((p) => typeof p === "string").join(".");
      if (key) map[key] = item.msg;
    });
  }
  return map;
}

function optionalUrl(value) {
  return value && value.trim() ? value.trim() : null;
}

function FieldInput({ label, name, value, onChange, onBlur, error, required, placeholder, type = "text" }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <span className="req">requerido</span>}
      </label>
      <input
        id={name}
        className={`form-input ${error ? "error" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur && onBlur()}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function FieldTextarea({ label, name, value, onChange, onBlur, error, required, placeholder }) {
  return (
    <div className="form-field full">
      <label htmlFor={name}>
        {label} {required && <span className="req">requerido</span>}
      </label>
      <textarea
        id={name}
        className={`form-textarea ${error ? "error" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur && onBlur()}
        rows={5}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default function ProjectForm() {
  const [communityToken, setCommunityToken] = useState("");
  const [values, setValues] = useState(INITIAL);
  const [iconFiles, setIconFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState({ icon: [], images: [] });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const validationErrors = useMemo(() => {
    const errors = validateProjectForm(values);
    if (iconFiles.length === 0) errors.icon = "El ícono es obligatorio.";
    return errors;
  }, [values, iconFiles]);

  const tokenOk = communityToken.trim().length >= MIN_TOKEN_LENGTH;
  const formValid = tokenOk && Object.keys(validationErrors).length === 0;

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function setAuthorField(key, value) {
    setValues((prev) => ({ ...prev, author: { ...prev.author, [key]: value } }));
    setServerErrors((prev) => ({ ...prev, [`author.${key}`]: undefined }));
  }

  function buildMetadata() {
    const author = {};
    Object.entries(values.author).forEach(([key, value]) => {
      author[key] = optionalUrl(value);
    });
    return {
      title: values.title.trim(),
      description: values.description.trim(),
      objectives: values.objectives.trim(),
      category: values.category,
      demo_video_url: optionalUrl(values.demo_video_url),
      website_url: values.website_url.trim(),
      author,
    };
  }

  const fieldError = (key) => {
    if (serverErrors[key]) return serverErrors[key];
    if (touched[key] || submitted) return validationErrors[key];
    return undefined;
  };

  const tokenError =
    (touched.communityToken || submitted) && !tokenOk
      ? `El token debe tener al menos ${MIN_TOKEN_LENGTH} caracteres.`
      : undefined;

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    setFormMessage(null);
    setServerErrors({});
    setSubmitted(true);

    if (!formValid) {
      return;
    }

    setSubmitting(true);
    try {
      await submitProject(buildMetadata(), iconFiles[0], imageFiles, communityToken.trim());
      setSuccess(true);
      setValues(INITIAL);
      setIconFiles([]);
      setImageFiles([]);
      setTouched({});
      setSubmitted(false);
      setUploadErrors({ icon: [], images: [] });
    } catch (err) {
      if (err.status === 401) {
        setFormMessage("No autorizado. El token de comunidad es inválido.");
      } else if (err.status === 400) {
        setFormMessage(typeof err.detail === "string" ? err.detail : "Archivo inválido.");
      } else if (err.status === 422) {
        setServerErrors(map422(err.info));
        setFormMessage("Revisa los campos marcados.");
      } else if (err.status === 429) {
        setFormMessage("Demasiados envíos. Espera un momento.");
      } else {
        setFormMessage("Ocurrió un error. Intenta nuevamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div>
        <div className="form-msg success" style={{ marginBottom: 20 }}>
          <Check />
          <span>
            Tu proyecto fue enviado y está en revisión. Te avisaremos cuando esté publicado.
          </span>
        </div>
        <p style={{ opacity: 0.8, fontSize: ".82rem", margin: "0 0 20px" }}>
          No aparecerá en el ranking hasta que un admin lo apruebe.
        </p>
        <Link to="/proyectos" className="btn btn-solid">
          Ir al directorio
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="token-field">
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label htmlFor="communityToken">
            Token de comunidad <span className="req">requerido</span>
          </label>
          <input
            id="communityToken"
            className={`form-input ${tokenError ? "error" : ""}`}
            type="password"
            value={communityToken}
            onChange={(e) => setCommunityToken(e.target.value)}
            onBlur={() => markTouched("communityToken")}
            placeholder="WEBNOVA-••••••••"
            autoComplete="off"
          />
          <span className="form-hint">
            Tu token identifica que perteneces a la comunidad de Webnova. Se envía como header{" "}
            <code>X-Community-Token</code> y no se guarda.
          </span>
          {tokenError && <span className="field-error">{tokenError}</span>}
        </div>
      </div>

      {formMessage && (
        <div className={`form-msg ${success ? "success" : ""}`}>
          {success ? <Check /> : <Send />}
          <span>{formMessage}</span>
        </div>
      )}

      <div className="form-grid">
        <FieldInput
          label="Título"
          name="title"
          value={values.title}
          onChange={(v) => setField("title", v)}
          onBlur={() => markTouched("title")}
          error={fieldError("title")}
          required
          placeholder="DesignGenius"
        />
        <div className="form-field">
          <label htmlFor="category">
            Categoría <span className="req">requerido</span>
          </label>
          <select
            id="category"
            className={`form-select ${fieldError("category") ? "error" : ""}`}
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            onBlur={() => markTouched("category")}
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          {fieldError("category") && <span className="field-error">{fieldError("category")}</span>}
        </div>

        <FieldInput
          label="URL del proyecto"
          name="website_url"
          value={values.website_url}
          onChange={(v) => setField("website_url", v)}
          onBlur={() => markTouched("website_url")}
          error={fieldError("website_url")}
          required
          placeholder="https://designgenius.dev"
        />
        <FieldInput
          label="Demo en video"
          name="demo_video_url"
          value={values.demo_video_url}
          onChange={(v) => setField("demo_video_url", v)}
          onBlur={() => markTouched("demo_video_url")}
          error={fieldError("demo_video_url")}
          placeholder="https://youtube.com/watch?v=..."
        />

        <FieldTextarea
          label="Descripción"
          name="description"
          value={values.description}
          onChange={(v) => setField("description", v)}
          onBlur={() => markTouched("description")}
          error={fieldError("description")}
          required
          placeholder="Crea logos con IA en segundos."
        />
        <FieldTextarea
          label="Objetivos"
          name="objectives"
          value={values.objectives}
          onChange={(v) => setField("objectives", v)}
          onBlur={() => markTouched("objectives")}
          error={fieldError("objectives")}
          required
          placeholder="Democratizar el diseño gráfico con IA."
        />

        <FieldInput
          label="Autor · GitHub"
          name="author.github"
          value={values.author.github}
          onChange={(v) => setAuthorField("github", v)}
          onBlur={() => markTouched("author.github")}
          error={fieldError("author.github")}
          required
          placeholder="https://github.com/usuario"
        />
        <FieldInput
          label="Autor · Sitio"
          name="author.website"
          value={values.author.website}
          onChange={(v) => setAuthorField("website", v)}
          onBlur={() => markTouched("author.website")}
          error={fieldError("author.website")}
          required
          placeholder="https://usuario.dev"
        />
        <FieldInput
          label="Autor · Email"
          name="author.email"
          value={values.author.email}
          onChange={(v) => setAuthorField("email", v)}
          onBlur={() => markTouched("author.email")}
          error={fieldError("author.email")}
          placeholder="usuario@correo.com"
        />
        <FieldInput
          label="Autor · TikTok"
          name="author.tiktok"
          value={values.author.tiktok}
          onChange={(v) => setAuthorField("tiktok", v)}
          onBlur={() => markTouched("author.tiktok")}
          error={fieldError("author.tiktok")}
          placeholder="https://tiktok.com/@usuario"
        />
        <FieldInput
          label="Autor · Instagram"
          name="author.instagram"
          value={values.author.instagram}
          onChange={(v) => setAuthorField("instagram", v)}
          onBlur={() => markTouched("author.instagram")}
          error={fieldError("author.instagram")}
          placeholder="https://instagram.com/usuario"
        />
        <FieldInput
          label="Autor · Facebook"
          name="author.facebook"
          value={values.author.facebook}
          onChange={(v) => setAuthorField("facebook", v)}
          onBlur={() => markTouched("author.facebook")}
          error={fieldError("author.facebook")}
          placeholder="https://facebook.com/usuario"
        />
        <FieldInput
          label="Autor · X"
          name="author.x"
          value={values.author.x}
          onChange={(v) => setAuthorField("x", v)}
          onBlur={() => markTouched("author.x")}
          error={fieldError("author.x")}
          placeholder="https://x.com/usuario"
        />

        <div className="form-field full">
          <label>
            Ícono del proyecto <span className="req">requerido</span>
          </label>
          <ImageUploader
            files={iconFiles}
            onChange={(files, errs) => {
              setIconFiles(files);
              setUploadErrors((prev) => ({ ...prev, icon: errs }));
            }}
            max={1}
            label="Ícono"
            required
          />
          {uploadErrors.icon.length > 0 && (
            <span className="field-error">{uploadErrors.icon.join(" · ")}</span>
          )}
          {uploadErrors.icon.length === 0 && fieldError("icon") && (
            <span className="field-error">{fieldError("icon")}</span>
          )}
        </div>

        <div className="form-field full">
          <label>
            Imágenes adicionales <span className="req">opcional · máx 4</span>
          </label>
          <ImageUploader
            files={imageFiles}
            onChange={(files, errs) => {
              setImageFiles(files);
              setUploadErrors((prev) => ({ ...prev, images: errs }));
            }}
            max={4}
            label="Imágenes"
          />
          {uploadErrors.images.length > 0 && (
            <span className="field-error">{uploadErrors.images.join(" · ")}</span>
          )}
        </div>
      </div>

      <button type="submit" className="btn btn-solid form-submit" disabled={submitting || !formValid}>
        {submitting ? <span className="spinner spinner-invert" /> : <Send />}
        {submitting ? "Enviando…" : "Enviar proyecto"}
      </button>
    </form>
  );
}