# Deploy Status Dashboard

A small React + Vite dashboard that I containerized with Docker in two ways: a **single-stage** build and a **multi-stage** build. The app shows its own build information, a simulated CI/CD pipeline, and a side-by-side comparison of the two image sizes.

## What this project demonstrates

- Packaging a React app as a Docker image
- **Single-stage build:** Node.js, npm, devDependencies, and source code all end up in the final image
- **Multi-stage build:** Node.js compiles the app, then only the static files are copied into a lightweight Nginx image
- Image size reduction (418 MB down to 93.8 MB, about 77.6% smaller)
- Port mapping (`-p HOST_PORT:CONTAINER_PORT`) and why the container port must match the app
- Container `HEALTHCHECK`, SPA routing and caching in Nginx
- Build-time configuration: `VITE_*` values are baked into the bundle during `docker build`

## Tech stack

React 19 · Vite 6 · Node.js 20 (Alpine) · Nginx (Alpine) · Docker

## Project structure

```text
deploy-status-dashboard/
├── src/
│   ├── components/
│   │   ├── ImageComparison.jsx
│   │   └── Pipeline.jsx
│   ├── data/
│   │   ├── images.js
│   │   └── pipeline.js
│   ├── App.jsx
│   ├── main.jsx
│   └── style.css
├── .dockerignore
├── Dockerfile.single
├── Dockerfile.multi
├── nginx.conf
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

## Port reference (read this first)

Most Docker errors in this project come from mixing up ports. Always check this table.

| Setup | Port inside the container | Host port | Browser URL |
| --- | --- | --- | --- |
| Local dev server (`npm run dev`) | 5173 | 5173 | http://localhost:5173 |
| Local preview (`npm run preview`) | 4173 | 4173 | http://localhost:4173 |
| Single-stage Docker | **4173** (Vite preview) | **3001** | http://localhost:3001 |
| Multi-stage Docker | **80** (Nginx) | **3002** | http://localhost:3002 |

The rule is `-p HOST_PORT:CONTAINER_PORT`. The container port has to match the port the app listens on inside the image.

---

## Option A: Run locally without Docker

**Requirements:** Node.js 20 or newer, npm

```bash
git clone <your-repo-url> deploy-status-dashboard   # or unzip the project
cd deploy-status-dashboard
npm ci
npm run dev
```

Open **http://localhost:5173**

To check the production build locally:

```bash
npm run build
npm run preview
```

Open **http://localhost:4173**

---

## Option B: Run with Docker, single-stage build

**Requirements:** Docker installed and running

```bash
docker build -f Dockerfile.single -t deploy-dashboard:single-stage .
docker run -d --name dashboard-single -p 3001:4173 deploy-dashboard:single-stage
```

Open **http://localhost:3001**

---

## Option C: Run with Docker, multi-stage build

```bash
docker build -f Dockerfile.multi -t deploy-dashboard:multi-stage .
docker run -d --name dashboard-multi -p 3002:80 deploy-dashboard:multi-stage
```

Open **http://localhost:3002**

Both containers can run at the same time because each one uses a different host port.

---

## Compare the two images

```bash
docker images deploy-dashboard
```

The single-stage image should be much larger than the multi-stage image. Exact sizes depend on your machine and base image versions.

## Inspect the containers

```bash
docker ps                                            # check the PORTS and STATUS columns
docker inspect --format='{{.State.Health.Status}}' dashboard-multi

# Single-stage: Node.js is present
docker exec -it dashboard-single sh
node -v
npm -v
ls
exit

# Multi-stage: only Nginx is present
docker exec -it dashboard-multi sh
nginx -v
ls /usr/share/nginx/html
node -v          # this should fail, because Node.js is not in the final image
exit
```

The health status shows `starting` for a few seconds after the container starts, then changes to `healthy`.

## Clean up

```bash
docker rm -f dashboard-single dashboard-multi
docker image rm deploy-dashboard:single-stage deploy-dashboard:multi-stage
```

---

## Deploy on an AWS EC2 instance

1. In the EC2 Security Group, add inbound rules for TCP **3001** and **3002** (source: your IP, or `0.0.0.0/0` for a public demo).
2. Run the same `docker build` and `docker run` commands on the instance.
3. Open `http://<EC2-PUBLIC-IP>:3001` or `http://<EC2-PUBLIC-IP>:3002` in your browser.

---

## Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| `Bind for 0.0.0.0:3002 failed: port is already allocated` | Another container is already using that host port | `docker ps` to find it, then `docker rm -f <name>` |
| `Conflict. The container name "/dashboard-multi" is already in use` | A container with that name already exists | `docker rm -f dashboard-multi`, then run again |
| `curl: (56) Recv failure: Connection reset by peer` | Port mismatch, for example `-p 3002:4173` on the Nginx image | Single-stage must use `-p 3001:4173`. Multi-stage must use `-p 3002:80` |
| Container shows `Created` in `docker ps -a` and is not running | The container was created but never started | `docker rm -f <name>`, then run the `docker run` command again |
| `DEPRECATED: The legacy builder is deprecated` | Docker is using the old builder | Use `DOCKER_BUILDKIT=1 docker build ...` or `docker buildx build ...` |
| Works on `localhost` but not on the EC2 public IP | The Security Group blocks the port | Add an inbound rule for TCP 3001 or 3002 |
| `Unable to find image 'xyz:v1' locally` | The image tag is wrong | Run `docker images` and use the exact tag |

## Key lessons

- **Multi-stage builds keep production images small.** Build tools stay in the builder stage and never reach the final image.
- **Ports are mapped on purpose.** The host port is for you, and the container port is what the app really listens on.
- **`VITE_*` variables are compile-time values.** Vite replaces them in the JavaScript bundle during `npm run build`. They are not read from the container's environment at runtime.
- **Lock your dependencies.** `npm ci` installs exactly what is in `package-lock.json`, which makes builds repeatable.
- **Health checks make a container's status visible.** `docker ps` shows whether the app is actually responding, not just whether the process is running.
