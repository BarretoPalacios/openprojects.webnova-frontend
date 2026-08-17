import Terminal from "../components/Terminal";
import ProjectForm from "../components/ProjectForm";

export default function SubmitProjectPage() {
  return (
    <section className="section" style={{ maxWidth: 940 }}>
      <div className="section-head">
        <div>
          <span className="section-tag">$ ./publicar-proyecto.sh</span>
          <h1 className="section-title">Publica tu proyecto</h1>
          <p className="section-sub">
            Envía tu proyecto a la comunidad. Pasa a revisión y aparecerá en el ranking cuando sea aprobado.
          </p>
        </div>
      </div>
      <Terminal path="publicar-proyecto.sh" bodyClassName="fade-up">
        <ProjectForm />
      </Terminal>
    </section>
  );
}