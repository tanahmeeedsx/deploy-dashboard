export const PIPELINE_STAGES = [
  {
    id: "commit",
    name: "Commit",
    description: "Code is pushed to the Git repository.",
  },
  {
    id: "build",
    name: "Build",
    description: "npm ci and npm run build compile the React app.",
  },
  {
    id: "test",
    name: "Verify",
    description: "Checks run before the image is packaged.",
  },
  {
    id: "package",
    name: "Containerize",
    description: "A Docker image is built from the Dockerfile.",
  },
  {
    id: "deploy",
    name: "Deploy",
    description: "The container is started with docker run and a port mapping.",
  },
  {
    id: "monitor",
    name: "Monitor",
    description: "The HEALTHCHECK confirms the container is healthy.",
  },
];
