export default function Terminal({ path, children, className = "", bodyClassName = "" }) {
  return (
    <div className={`term ${className}`}>
      <div className="term-bar">
        <div className="term-dots">
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-dot" />
        </div>
        {path && <span className="term-path">{path}</span>}
      </div>
      <div className={`term-body ${bodyClassName}`}>{children}</div>
    </div>
  );
}