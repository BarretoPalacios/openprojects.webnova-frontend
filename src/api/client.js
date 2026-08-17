export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(status, detail, info) {
    super(typeof detail === "string" ? detail : "Error en la solicitud");
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.info = info;
  }
}

export async function parseError(response) {
  try {
    const body = await response.json();
    return body;
  } catch {
    return {};
  }
}

function mergeOptions(options = {}) {
  const { credentials, headers, ...rest } = options;
  return {
    credentials: credentials ?? "include",
    ...(headers ? { headers } : {}),
    ...rest,
  };
}

export async function getJSON(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, mergeOptions(options));
  if (!response.ok) {
    const info = await parseError(response);
    throw new ApiError(response.status, info.detail ?? response.statusText, info);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function postJSON(path, body, options = {}) {
  const { headers: customHeaders, ...rest } = options;
  const hasBody = body !== undefined && body !== null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...customHeaders,
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
    ...mergeOptions(rest),
  });
  if (!response.ok) {
    const info = await parseError(response);
    throw new ApiError(response.status, info.detail ?? response.statusText, info);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function postForm(path, formData, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    ...mergeOptions(options),
  });
  if (!response.ok) {
    const info = await parseError(response);
    throw new ApiError(response.status, info.detail ?? response.statusText, info);
  }
  if (response.status === 204) return null;
  return response.json();
}