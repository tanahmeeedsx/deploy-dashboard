// Disk usage from `docker images` on the test machine.
// After you build on your own machine, replace these numbers with your own results.
export const IMAGE_BUILDS = [
  {
    name: "Single-stage",
    tag: "deploy-dashboard:single-stage",
    sizeMB: 418,
    runtime: "Node.js + npm + source code",
  },
  {
    name: "Multi-stage",
    tag: "deploy-dashboard:multi-stage",
    sizeMB: 93.8,
    runtime: "Nginx + static files only",
  },
];
