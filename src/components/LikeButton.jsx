import { useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ count, active, flushing, liked, onLike }) {
  const [pop, setPop] = useState(false);
  const isLiked = Boolean(active || liked);
  const disabled = flushing || liked;

  function handleClick() {
    setPop(true);
    setTimeout(() => setPop(false), 300);
    onLike();
  }

  return (
    <button
      type="button"
      className={`vote-btn ${isLiked ? "active" : ""} ${pop ? "vote-pop" : ""}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={liked ? "Ya votaste por este proyecto" : "Votar por este proyecto"}
      title={liked ? "Ya votaste por este proyecto" : undefined}
    >
      <Heart fill={isLiked ? "currentColor" : "none"} />
      <span className="vote-count">{count}</span>
      <span>{liked ? "Votado" : "Me gusta"}</span>
      {flushing && <span className="spinner" />}
    </button>
  );
}