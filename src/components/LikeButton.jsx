import { useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ count, active, flushing, onLike }) {
  const [pop, setPop] = useState(false);

  function handleClick() {
    setPop(true);
    setTimeout(() => setPop(false), 300);
    onLike();
  }

  return (
    <button
      type="button"
      className={`vote-btn ${active ? "active" : ""} ${pop ? "vote-pop" : ""}`}
      onClick={handleClick}
      disabled={flushing}
      aria-label="Votar por este proyecto"
    >
      <Heart fill={active ? "currentColor" : "none"} />
      <span className="vote-count">{count}</span>
      <span>Me gusta</span>
      {flushing && <span className="spinner" />}
    </button>
  );
}