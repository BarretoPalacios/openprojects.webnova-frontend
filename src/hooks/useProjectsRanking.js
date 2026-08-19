import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../api/client";
import { getActiveProjects } from "../api/projects";
import { sendLikeBatch } from "../api/likes";
import { useSSE } from "./useSSE";

const FLUSH_DEBOUNCE_MS = 800;
const MAX_BATCH = 50;
const RETRY_MS = 2000;
const LIKED_STORAGE_KEY = "webnova_liked_projects";

function loadLikedProjects() {
  try {
    const raw = localStorage.getItem(LIKED_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useProjectsRanking({ onRateLimit, onNetworkError, onNotFound } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [serverScores, setServerScores] = useState({});
  const [pendingClicks, setPendingClicks] = useState({});
  const [flushing, setFlushing] = useState({});
  const [liked, setLiked] = useState(loadLikedProjects);

  const pendingRef = useRef({});
  const timersRef = useRef({});
  const retryTimersRef = useRef({});

  const { snapshot, connectionState } = useSSE(`${API_BASE_URL}/api/stream`);

  const applyServerScores = useCallback((updates) => {
    setServerScores((prev) => {
      const next = { ...prev };
      for (const [id, score] of Object.entries(updates)) {
        const numeric = Number(score);
        if (Number.isFinite(numeric)) {
          next[id] = Math.max(next[id] ?? 0, numeric);
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    applyServerScores(snapshot);
  }, [snapshot, applyServerScores]);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    getActiveProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => {
    let cancelled = false;
    getActiveProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  const doFlush = useCallback(
    async (projectId) => {
      const count = pendingRef.current[projectId] ?? 0;
      if (count <= 0) return;

      const toSend = Math.min(count, MAX_BATCH);
      setFlushing((prev) => ({ ...prev, [projectId]: true }));

      try {
        const result = await sendLikeBatch(projectId, toSend);
        const score = Number(result?.score);
        if (Number.isFinite(score)) {
          applyServerScores({ [projectId]: score });
        }
        if (typeof result?.liked === "boolean") {
          markLiked(projectId);
        }
        pendingRef.current = { ...pendingRef.current, [projectId]: 0 };
        setPendingClicks({ ...pendingRef.current });
      } catch (err) {
        if (err?.status === 429) {
          if (onRateLimit) onRateLimit(projectId);
        } else if (err?.status === 404) {
          pendingRef.current = { ...pendingRef.current, [projectId]: 0 };
          setPendingClicks({ ...pendingRef.current });
          if (onNotFound) onNotFound(projectId);
        } else if (err?.status === 400) {
          pendingRef.current = { ...pendingRef.current, [projectId]: 0 };
          setPendingClicks({ ...pendingRef.current });
        } else {
          if (onNetworkError) onNetworkError(projectId);
          clearTimeout(retryTimersRef.current[projectId]);
          retryTimersRef.current[projectId] = setTimeout(() => doFlush(projectId), RETRY_MS);
        }
      } finally {
        setFlushing((prev) => ({ ...prev, [projectId]: false }));
      }
    },
    [onRateLimit, onNetworkError, onNotFound, applyServerScores, markLiked]
  );

  const scheduleFlush = useCallback(
    (projectId) => {
      clearTimeout(timersRef.current[projectId]);
      timersRef.current[projectId] = setTimeout(() => doFlush(projectId), FLUSH_DEBOUNCE_MS);
    },
    [doFlush]
  );

  const like = useCallback(
    (projectId) => {
      if (liked.has(projectId)) return;
      if ((pendingRef.current[projectId] ?? 0) > 0) return;
      const next = { ...pendingRef.current, [projectId]: 1 };
      pendingRef.current = next;
      setPendingClicks(next);
      scheduleFlush(projectId);
    },
    [liked, scheduleFlush]
  );

  const markLiked = useCallback((projectId) => {
    setLiked((prev) => {
      if (prev.has(projectId)) return prev;
      const next = new Set(prev);
      next.add(projectId);
      try {
        localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  useEffect(
    () => () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      Object.values(retryTimersRef.current).forEach(clearTimeout);
    },
    []
  );

  const scores = useMemo(() => {
    const out = {};
    projects.forEach((project) => {
      const serverScore = serverScores[project.id] ?? project.likes_count ?? 0;
      const pending = pendingClicks[project.id] ?? 0;
      out[project.id] = {
        serverScore,
        pending,
        displayScore: serverScore + pending,
        flushing: Boolean(flushing[project.id]),
        liked: liked.has(project.id),
      };
    });
    return out;
  }, [projects, serverScores, pendingClicks, flushing, liked]);

  return { projects, scores, liked, loading, loadError, reload: load, refresh, like, connectionState };
}