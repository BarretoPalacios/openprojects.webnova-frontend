import { getJSON, postJSON } from "./client";
import { normalizeProject } from "./normalize";

function adminHeaders(adminToken) {
  return { "X-Admin-Token": adminToken };
}

export function listPendingProjects(adminToken) {
  return getJSON("/api/admin/projects/pending", { headers: adminHeaders(adminToken) }).then((data) =>
    (Array.isArray(data) ? data : []).map(normalizeProject)
  );
}

export function listAllProjects(adminToken) {
  return getJSON("/api/admin/projects", { headers: adminHeaders(adminToken) }).then((data) =>
    (Array.isArray(data) ? data : []).map(normalizeProject)
  );
}

export function approveProject(adminToken, projectId) {
  return postJSON(`/api/admin/projects/${projectId}/approve`, null, { headers: adminHeaders(adminToken) }).then(
    normalizeProject
  );
}

export function rejectProject(adminToken, projectId) {
  return postJSON(`/api/admin/projects/${projectId}/reject`, null, { headers: adminHeaders(adminToken) }).then(
    normalizeProject
  );
}

export function deactivateProject(adminToken, projectId) {
  return postJSON(`/api/admin/projects/${projectId}/deactivate`, null, { headers: adminHeaders(adminToken) }).then(
    normalizeProject
  );
}