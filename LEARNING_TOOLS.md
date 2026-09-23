# 42 Horizon — DevOps Learning Roadmap

> Personal learning reference for the DevOps part of ft_transcendence.
>
> Goal: learn only what is useful for the DevOps modules and infrastructure work.
> Start simple. Do not study advanced tools before the application exists.

## Current priority

Right now there is no production frontend or backend yet.

So focus on:

1. Docker basics
2. Docker Compose
3. Docker networking
4. Reverse proxy
5. HTTPS / TLS
6. Health checks
7. CI with GitHub Actions

Only after the application exists, continue with monitoring, logging, backups, and optional microservices.

---

# 1. Minimum Linux knowledge

You do not need a full Linux course.

Know these commands:

```bash
pwd
ls
cd
mkdir
touch
cp
mv
rm
cat
less
grep
find

ps
top
kill

chmod
chown

curl
wget
ss

env
export

sudo
apt
```

Understand:

- files and directories
- processes
- permissions
- environment variables
- ports
- services

Resource:

- Ubuntu command line tutorial:
  https://ubuntu.com/tutorials/command-line-for-beginners

---

# 2. Docker

This is the first main topic to learn.

## Understand

```text
IMAGE
=
template used to create containers

CONTAINER
=
running instance of an image
```

Learn:

- Dockerfile
- image
- container
- build
- run
- stop
- remove
- logs
- exec
- environment variables
- ports
- volumes
- networks
- health checks

Important commands:

```bash
docker ps
docker ps -a
docker images

docker pull
docker build
docker run

docker stop
docker rm

docker logs
docker exec
docker inspect

docker network ls
docker volume ls
```

Resources:

- Docker Get Started:
  https://docs.docker.com/get-started/
- Play with Docker:
  https://labs.play-with-docker.com/

Goal:

Be able to start a container, inspect it, read its logs, enter it, stop it, and understand how it connects to the host.

---

# 3. Docker Compose

Horizon will have multiple services.

Example future structure:

```text
frontend
backend
postgres
reverse-proxy
```

Docker Compose lets us define and start them together.

Learn:

- `services`
- `build`
- `image`
- `ports`
- `environment`
- `env_file`
- `volumes`
- `networks`
- `depends_on`
- health checks

Commands:

```bash
docker compose up
docker compose up --build
docker compose down
docker compose ps
docker compose logs
docker compose logs -f
```

Resource:

- Docker Compose Quickstart:
  https://docs.docker.com/compose/gettingstarted/

Goal:

Eventually another teammate should be able to clone Horizon and start the whole stack with one documented command.

---

# 4. Docker networking

This is very important for Horizon.

Learn:

- service names
- container ports
- host ports
- private networks
- published ports
- Docker DNS

Important example:

```text
backend → postgres:5432
```

If `postgres` is the Compose service name, Docker can resolve it internally.

This is usually wrong from another container:

```text
backend → localhost:5432
```

because `localhost` refers to the backend container itself.

Future architecture:

```text
Internet
   │
   ▼
Reverse Proxy
   │
   ├── frontend
   └── backend
          │
          ▼
      PostgreSQL

PostgreSQL stays on an internal Docker network.
```

Resource:

- Docker networking:
  https://docs.docker.com/engine/network/

Goal:

Know which services need public ports and which should stay private.

---

# 5. Reverse proxy

Likely choices are Nginx or Caddy.

Mental model:

```text
                  ┌── frontend
Browser → :443 ───┤
                  └── backend
```

The user may visit:

```text
https://horizon.local/
https://horizon.local/api/
```

while internally the proxy routes traffic to different containers.

Learn:

- reverse proxy
- upstream
- routing
- proxy headers
- TLS termination
- `proxy_pass` if using Nginx

Resource:

- Nginx beginner guide:
  https://nginx.org/en/docs/beginners_guide.html

Goal:

Understand why only the reverse proxy needs to be the main public entry point.

---

# 6. HTTPS / TLS

Learn only the infrastructure side.

Understand:

- HTTP vs HTTPS
- TLS
- certificate
- public key
- private key
- certificate authority
- TLS termination

Mental model:

```text
Browser
   │
   │ HTTPS
   ▼
Reverse Proxy
   │
   │ internal Docker traffic
   ▼
Backend
```

Resource:

- MDN TLS:
  https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security

Goal:

Be able to configure HTTPS at the reverse proxy and explain what the certificate and private key do.

---

# 7. Health checks

A running process is not always a healthy application.

Future example:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Later it may check:

```text
backend   ✅
database  ✅
storage   ✅
```

Learn:

- Docker health checks
- readiness
- liveness
- dependency startup
- failure detection

Goal:

Docker and monitoring tools should be able to tell whether a service is actually usable.

This also supports the DevOps minor module for health/status/backup/disaster recovery.

---

# 8. GitHub Actions / CI

Learn this once the team has code that can build and test.

Mental model:

```text
git push / pull request
        ↓
GitHub Actions
        ↓
install dependencies
        ↓
lint
        ↓
typecheck
        ↓
tests
        ↓
build
        ↓
PASS / FAIL
```

Learn:

- workflow
- event
- job
- step
- runner
- artifact
- repository secrets

Resource:

- GitHub Actions Quickstart:
  https://docs.github.com/en/actions/get-started/quickstart

Goal:

The first CI should simply answer:

> Does this change build and do its tests pass?

Do not start with complicated deployment automation.

---

# 9. Prometheus

Learn Prometheus only after the backend exists.

Prometheus collects metrics.

```text
Backend /metrics
       ↑
       │ scrape
       │
  Prometheus
```

Learn:

- metric
- counter
- gauge
- histogram
- label
- target
- scraping
- basic PromQL

Useful future Horizon metrics:

- request count
- response latency
- HTTP errors
- active WebSocket connections
- CPU
- memory
- database connections

Resource:

- Prometheus First Steps:
  https://prometheus.io/docs/introduction/first_steps/

Goal:

Collect useful metrics from the running system.

---

# 10. Grafana

Grafana visualizes metrics.

```text
Application
    ↓
Prometheus
    ↓
Grafana
    ↓
Dashboard
```

Learn:

- data source
- dashboard
- panel
- query
- alert

Resource:

- Grafana Getting Started:
  https://grafana.com/docs/grafana/latest/fundamentals/getting-started/

Goal:

Build custom dashboards and alerts for the Prometheus/Grafana Major module.

---

# 11. Logging

Before ELK, understand good logs.

Bad:

```text
error
```

Better:

```json
{
  "level": "error",
  "event": "database_connection_failed",
  "requestId": "123",
  "timestamp": "..."
}
```

Learn:

- structured logs
- log levels
- timestamps
- request IDs
- log rotation
- retention

Goal:

The logs should help answer:

> What failed, when did it fail, and where did it fail?

---

# 12. ELK

ELK is one of the DevOps Major modules.

```text
Application logs
      ↓
   Logstash
      ↓
Elasticsearch
      ↓
    Kibana
```

Understand:

- Logstash = collect / transform logs
- Elasticsearch = store / index / search logs
- Kibana = search / visualize logs

Resource:

- Elastic Stack fundamentals:
  https://www.elastic.co/docs/get-started/the-stack

Goal:

Centralize logs, create useful Kibana dashboards, configure retention/archiving, and secure access.

---

# 13. Backups and disaster recovery

A backup is useless if restore does not work.

Learn:

- PostgreSQL dump
- restore
- volume backup
- retention
- scheduled backups
- recovery procedure
- RPO
- RTO

Practical demonstration:

```text
create test data
      ↓
backup database
      ↓
remove test data
      ↓
restore backup
      ↓
verify data returned
```

Goal:

Be able to prove that backup and restore actually work.

---

# 14. Microservices — optional and last

Do not prioritize this now.

The DevOps category includes a Major module for a microservices backend, but Horizon currently plans a modular monolith first.

Microservices add:

- multiple backend services
- service boundaries
- inter-service communication
- independent containers
- distributed failures
- service-to-service APIs
- much harder debugging and monitoring

Only study this if the team later decides that the extra 2 points are worth the added complexity.

---

# DevOps learning order

## Right now

```text
Docker
  ↓
Docker Compose
  ↓
Docker Networking
  ↓
Reverse Proxy
  ↓
HTTPS
  ↓
Health Checks
```

## When frontend/backend code exists

```text
Containerize the real application
  ↓
One-command startup
  ↓
GitHub Actions / CI
  ↓
Health checks on real services
```

## When the application runs reliably

```text
Prometheus
  ↓
Grafana
  ↓
Structured Logging
  ↓
ELK
  ↓
Backups + Restore
```

## Optional later

```text
Microservices
```

---

# DevOps modules from the subject

Your possible DevOps module points are:

| Module | Type | Points |
| --- | --- | ---: |
| ELK log management | Major | 2 |
| Prometheus + Grafana monitoring | Major | 2 |
| Backend as microservices | Major | 2 |
| Health checks + status page + backups/disaster recovery | Minor | 1 |

Total possible DevOps points: **7**.

A realistic Horizon target without microservices is:

```text
ELK                      2
Prometheus + Grafana     2
Health / backup          1
                        ──
                         5 points
```

---

# Core bookmarks

| Topic | Resource |
| --- | --- |
| Linux basics | https://ubuntu.com/tutorials/command-line-for-beginners |
| Docker | https://docs.docker.com/get-started/ |
| Docker Compose | https://docs.docker.com/compose/gettingstarted/ |
| Docker networking | https://docs.docker.com/engine/network/ |
| Nginx | https://nginx.org/en/docs/beginners_guide.html |
| HTTPS / TLS | https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security |
| GitHub Actions | https://docs.github.com/en/actions/get-started/quickstart |
| Prometheus | https://prometheus.io/docs/introduction/first_steps/ |
| Grafana | https://grafana.com/docs/grafana/latest/fundamentals/getting-started/ |
| Elastic Stack | https://www.elastic.co/docs/get-started/the-stack |

---

# Main rule

Do not install tools just to say they exist.

For every DevOps component, be able to explain:

1. What problem does it solve?
2. Where does it sit in Horizon's architecture?
3. How is it configured?
4. How do we test that it works?
5. What happens when it fails?

That is the level of understanding needed for the evaluation.
