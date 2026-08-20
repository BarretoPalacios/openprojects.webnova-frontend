export const CATEGORIES = ["saas", "tool", "api", "extension", "mobile_app", "other"];

export const STATUSES = ["pending", "active", "inactive", "rejected"];

export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

export const MAX_FILE_SIZE_MB = 5;

const URL_RE = /^https?:\/\/[^\s]+$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function notEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidUrl(value) {
  if (!notEmpty(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidEmail(value) {
  if (!notEmpty(value)) return false;
  return EMAIL_RE.test(value.trim());
}

export function validateFile(file) {
  const errors = [];
  const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(`Extensión ".${ext || "sin extensión"}" no permitida. Usa: ${ALLOWED_EXTENSIONS.join(", ")}`);
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    errors.push(`"${file.name}" pesa más de ${MAX_FILE_SIZE_MB}MB.`);
  }
  if (file.size === 0) {
    errors.push(`"${file.name}" llegó vacío.`);
  }
  return errors;
}

export function validateProjectForm(values) {
  const errors = {};

  if (!notEmpty(values.title) || values.title.trim().length < 3 || values.title.trim().length > 150) {
    errors.title = "El título debe tener entre 3 y 150 caracteres.";
  }

  if (!notEmpty(values.description) || values.description.trim().length < 10 || values.description.trim().length > 2000) {
    errors.description = "La descripción debe tener entre 10 y 2000 caracteres.";
  }

  if (!notEmpty(values.objectives) || values.objectives.trim().length < 10 || values.objectives.trim().length > 2000) {
    errors.objectives = "Los objetivos deben tener entre 10 y 2000 caracteres.";
  }

  if (!CATEGORIES.includes(values.category)) {
    errors.category = "Selecciona una categoría.";
  }

  if (!isValidUrl(values.website_url)) {
    errors.website_url = "URL inválida (http/https).";
  }

  if (notEmpty(values.demo_video_url) && !isValidUrl(values.demo_video_url)) {
    errors.demo_video_url = "URL inválida (http/https).";
  }

  if (!isValidUrl(values.author.github)) {
    errors["author.github"] = "URL inválida (http/https).";
  }

  if (!isValidUrl(values.author.website)) {
    errors["author.website"] = "URL inválida (http/https).";
  }

  ["tiktok", "instagram", "facebook", "x"].forEach((key) => {
    if (notEmpty(values.author[key]) && !isValidUrl(values.author[key])) {
      errors[`author.${key}`] = "URL inválida (http/https).";
    }
  });

  if (notEmpty(values.author.email) && !isValidEmail(values.author.email)) {
    errors["author.email"] = "Email inválido.";
  }

  return errors;
}