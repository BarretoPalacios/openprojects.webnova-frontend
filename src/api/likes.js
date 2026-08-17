import { postJSON } from "./client";

export function sendLikeBatch(projectId, count) {
  return postJSON(`/api/projects/${projectId}/like`, { count }, { credentials: "include" });
}