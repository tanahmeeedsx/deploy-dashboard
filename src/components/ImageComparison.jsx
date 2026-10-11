import { IMAGE_BUILDS } from "../data/images.js";

export default function ImageComparison() {
  const sizes = IMAGE_BUILDS.map((build) => build.sizeMB);
  const largest = Math.max(...sizes);
  const smallest = Math.min(...sizes);
  const reductionPercent = ((largest - smallest) / largest) * 100;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Image size: single-stage vs multi-stage</h2>
          <p>Same app, two Dockerfiles. The final stage decides what ships.</p>
        </div>
        <div className="stat">
          <strong>{reductionPercent.toFixed(1)}%</strong>
          <span>smaller image</span>
        </div>
      </div>

      <div className="bars">
        {IMAGE_BUILDS.map((build) => (
          <div className="bar-row" key={build.tag}>
            <div className="bar-meta">
              <span>{build.name}</span>
              <code>{build.tag}</code>
              <small>{build.runtime}</small>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(build.sizeMB / largest) * 100}%` }}
              />
            </div>
            <span className="bar-value">{build.sizeMB} MB</span>
          </div>
        ))}
      </div>
    </section>
  );
}
