import { useEffect, useState } from "react";
import { PIPELINE_STAGES } from "../data/pipeline.js";

const STEP_DELAY_MS = 900;

export default function Pipeline() {
  // `progress` = number of stages already completed
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const total = PIPELINE_STAGES.length;
  const finished = progress >= total;

  useEffect(() => {
    if (!running) return;

    if (finished) {
      setRunning(false);
      return;
    }

    const timer = setTimeout(() => setProgress((p) => p + 1), STEP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [running, progress, finished]);

  const startDeployment = () => {
    setProgress(0);
    setRunning(true);
  };

  const statusOf = (index) => {
    if (index < progress) return "done";
    if (index === progress && running) return "running";
    return "pending";
  };

  let buttonLabel = "Run deployment";
  if (running) buttonLabel = "Deploying…";
  else if (finished) buttonLabel = "Deploy again";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>CI/CD pipeline</h2>
          <p>Simulated flow from a commit to a running container.</p>
        </div>
        <button className="btn" onClick={startDeployment} disabled={running}>
          {buttonLabel}
        </button>
      </div>

      <ol className="pipeline">
        {PIPELINE_STAGES.map((stage, index) => {
          const status = statusOf(index);
          return (
            <li key={stage.id} className={`stage stage-${status}`}>
              <span className="stage-dot">
                {status === "done" ? "✓" : index + 1}
              </span>
              <div>
                <strong>{stage.name}</strong>
                <p>{stage.description}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {finished && (
        <p className="success">
          Deployment successful. The container is serving traffic.
        </p>
      )}
    </section>
  );
}
