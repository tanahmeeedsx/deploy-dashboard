import Pipeline from "./components/Pipeline.jsx";
import ImageComparison from "./components/ImageComparison.jsx";

// Injected at build time by vite.config.js (see `define`)
const APP_VERSION = __APP_VERSION__;
const BUILD_TIME = __BUILD_TIME__;

// Set by the Dockerfile with ENV. Falls back when running `npm run dev` or `npm run build` directly.
const BUILD_TYPE = import.meta.env.VITE_BUILD_TYPE || "Local build (no Docker)";

function formatBuildTime(iso) {
  const formatted = new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
  return `${formatted} UTC`;
}

export default function App() {
  const details = [
    { label: "Build type", value: BUILD_TYPE },
    { label: "App version", value: `v${APP_VERSION}` },
    { label: "Built at", value: formatBuildTime(BUILD_TIME) },
    { label: "Vite mode", value: import.meta.env.MODE },
  ];

  return (
    <div className="app">
      <header className="hero">
        <span className="badge">Docker · React · Vite · Nginx</span>
        <h1>Deploy Status Dashboard</h1>
        <p>
          A small React app that shows how it was built, containerized and shipped.
        </p>
      </header>

      <section className="info-grid">
        {details.map((item) => (
          <div className="card" key={item.label}>
            <span className="card-label">{item.label}</span>
            <strong className="card-value">{item.value}</strong>
          </div>
        ))}
      </section>

      <Pipeline />
      <ImageComparison />

      <footer className="footer">
        Single-stage vs multi-stage Docker builds, side by side
      </footer>
    </div>
  );
}
