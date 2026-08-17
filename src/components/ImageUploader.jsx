import { useEffect, useRef } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { validateFile, MAX_FILE_SIZE_MB } from "../lib/validation";

function FilePreview({ file, alt }) {
  const url = URL.createObjectURL(file);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return <img src={url} alt={alt} />;
}

export default function ImageUploader({ files, onChange, max, label, required }) {
  const inputRef = useRef(null);

  function handleFiles(selected) {
    const list = Array.from(selected);
    const valid = [];
    const errors = [];
    list.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length) errors.push(...fileErrors);
      else valid.push(file);
    });
    onChange([...files, ...valid].slice(0, max), errors);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index) {
    onChange(files.filter((_, i) => i !== index), []);
  }

  return (
    <div className="uploader" onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        multiple={max > 1}
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => e.stopPropagation()}
      />
      <div className={`uploader-inner ${files.length ? "has-files" : ""}`}>
        {files.length === 0 && (
          <>
            <span className="uploader-icon">
              <ImageIcon />
            </span>
            <span className="uploader-text">
              {label} · máx {max} · hasta {MAX_FILE_SIZE_MB}MB {required ? "· requerido" : ""}
            </span>
          </>
        )}
        {files.length > 0 && (
          <div className="uploader-files">
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="uploader-file">
                <FilePreview file={file} alt={file.name} />
                <span className="uploader-file-name">{file.name}</span>
                <button
                  type="button"
                  className="uploader-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                  aria-label="Quitar archivo"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            {files.length < max && (
              <span className="uploader-add">
                <Plus />
                Agregar
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}