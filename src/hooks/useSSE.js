import { useEffect, useState } from "react";

export function useSSE(url) {
  const [snapshot, setSnapshot] = useState({});

  useEffect(() => {
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        setSnapshot(JSON.parse(event.data));
      } catch {}
    };

    return () => es.close();
  }, [url]);

  return { snapshot };
}