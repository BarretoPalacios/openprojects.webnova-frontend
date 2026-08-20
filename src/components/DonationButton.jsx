import { useEffect, useState } from "react";
import { Coffee, X } from "lucide-react";
import SVGComponent from "./SVGComponent";

export default function DonationButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="donate-fab"
        onClick={() => setOpen(true)}
        aria-label="Donar, invítanos un café"
        title="Invítanos un café"
      >
        <Coffee />
        <span>Donar</span>
      </button>

      <div
        className={`modal-overlay ${open ? "open" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <div className="modal-box">
          <div className="term">
            <div className="term-bar">
              <div className="term-dots">
                <span className="term-dot" />
                <span className="term-dot" />
                <span className="term-dot" />
              </div>
              <span className="term-path">~/donate</span>
              <button type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="Cerrar">
                <X />
              </button>
            </div>
            <div className="term-body">
              <div className="donate-head">
                <Coffee className="donate-icon" />
                <div>
                  <span className="section-tag">// contribución</span>
                  <h3 className="donate-title">INVÍTAME LA INKA KOLA PE <SVGComponent className="w-5 inline-flex
                    "/></h3>
                </div>
              </div>
              <p className="donate-text">
                Tu apoyo mantiene Openproject Webnova en línea y en crecimiento, se paga el vps y storage de la web. Escanea el código QR para contribuir.
              </p>
              <div className="donate-qr-wrap">
                <img className="donate-qr" src="qr.png" alt="Código QR de donación" />
              </div>
              <p className="donate-hint">[ escanea y apoya el proyecto ]</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
