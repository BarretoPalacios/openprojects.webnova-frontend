import { useEffect, useState } from "react";

export function useSSE(url) {
  const [snapshot, setSnapshot] = useState({});
  const [connectionState, setConnectionState] = useState("connecting");

  useEffect(() => {
    const es = new EventSource(url);

    es.onopen = () => setConnectionState("connected");
    es.onmessage = (event) => {
      try {
        setSnapshot(JSON.parse(event.data));
      } catch {}
      setConnectionState("connected");
    };
    es.onerror = () => setConnectionState("reconnecting");

    return () => es.close();
  }, [url]);

  return { snapshot, connectionState };
}