import { getJSON, postForm } from "./client";
import { normalizeProject } from "./normalize";

export function getActiveProjects() {
  return getJSON("/api/projects").then((data) =>
    (Array.isArray(data) ? data : []).map(normalizeProject)
  );
}

export function submitProject(metadata, iconFile, imageFiles, communityToken) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(metadata));
  formData.append("icon", iconFile);
  imageFiles.forEach((file) => formData.append("images", file));

  return postForm("/api/projects", formData, {
    headers: { "X-Community-Token": communityToken },
  }).then(normalizeProject);
}