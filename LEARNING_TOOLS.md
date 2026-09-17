# 42 Horizon — Learning Tools and Study Roadmap

> Personal learning reference for the Security / DevOps part of ft_transcendence.
>
> Assumption: start from zero knowledge and learn in the order the concepts become useful.
> Do not try to master every topic before working on the project. Learn the current phase,
> apply it to Horizon, then continue.

## How to use this file

The roadmap is ordered intentionally.

For now, focus on:

1. Linux and terminal
2. Networking basics
3. HTTP
4. Git and GitHub
5. Web application architecture
6. JavaScript / TypeScript basics
7. SQL / PostgreSQL
8. Docker
9. Docker networking
10. Reverse proxy
11. HTTPS / TLS
12. Authentication vs authorization

After the application exists, continue with web security, CI/CD, monitoring, logging,
backups, Vault, ModSecurity, and the other advanced topics.

---

# Phase 1 — Foundations

## 1. Linux and the terminal

### Learn these concepts

- filesystem
- directory and file
- absolute vs relative path
- process and PID
- environment variable
- user and root
- permissions
- service
- port
- package
- shell
- stdin / stdout / stderr

### Commands to know

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
head
tail
grep
find

which
whereis

ps
top
kill

chmod
chown

curl
wget

ss
ping

env
export

sudo
apt
```

### Resource

- Ubuntu — Linux command line for beginners:
  https://ubuntu.com/tutorials/command-line-for-beginners

### Goal

Be comfortable moving around Linux, reading files, inspecting processes, checking ports,
using environment variables, and running commands without depending on a GUI.

---

## 2. Networking fundamentals

### Learn these concepts

- IP address
- IPv4
- localhost
- `127.0.0.1`
- `0.0.0.0`
- DNS
- domain name
- port
- TCP
- UDP
- socket
- client
- server
- firewall
- private network
- public network

### Mental model

```text
Computer
   ↓
IP address
   ↓
Network
   ↓
DNS
   ↓
Server IP
   ↓
Port
   ↓
TCP connection
   ↓
Application protocol
```

### Goal

Be able to explain how one program connects to another program over a network and why
ports and IP addresses matter.

---

## 3. HTTP

HTTP is the main protocol used between the browser and backend.

### Learn

- URL
- request
- response
- headers
- body
- JSON
- cookies
- HTTP methods
- status codes

### Methods

```text
GET
POST
PUT
PATCH
DELETE
```

### Important status codes

```text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

### Important headers

```text
Content-Type
Authorization
Cookie
Set-Cookie
Origin
Host
```

### Example request

```http
POST /api/v1/login HTTP/1.1
Host: horizon.example
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret"
}
```

### Resource

- MDN HTTP:
  https://developer.mozilla.org/en-US/docs/Web/HTTP

### Goal

Be able to look at an HTTP request and understand what the browser is sending to the
backend.

---

## 4. Git and GitHub

### Learn these concepts

- working directory
- staging area
- commit
- branch
- remote
- origin
- fetch
- pull
- push
- merge
- conflict
- pull request
- review
- tag
- release

### Commands

```bash
git status
git diff
git diff --cached

git add
git commit

git log

git branch
git switch

git fetch
git pull
git push

git merge

git remote -v
```

### Resources

- Official Git learning resources:
  https://git-scm.com/learn
- Pro Git book:
  https://git-scm.com/book/en/v2

Also read the project's own `VERSIONING.md`, because it defines the team's actual workflow.

### Goal

Understand what Git is doing instead of only memorizing commands.

---

## 5. Web application architecture

Understand this before learning frameworks deeply.

```text
User
 ↓
Browser / Frontend
 ↓
HTTP or HTTPS request
 ↓
Backend
 ↓
Validation
 ↓
Business logic
 ↓
Database
 ↓
Backend response
 ↓
Frontend updates
```

For Horizon, the expected architecture may eventually resemble:

```text
                       Internet
                          │
                       HTTPS/WSS
                          │
                          ▼
                  Reverse Proxy
                    /        \
                   /          \
                  ▼            ▼
             Frontend       Backend
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
            PostgreSQL    File Storage   External APIs
```

### Goal

Be able to trace one user action from the browser all the way to the database and back.

---

## 6. JavaScript and TypeScript basics

You do not need to become a frontend expert.

### JavaScript basics

Learn:

- `const` and `let`
- strings
- numbers
- booleans
- objects
- arrays
- functions
- classes
- modules
- `import` / `export`
- JSON
- exceptions
- `try/catch`
- Promise
- `async/await`

### TypeScript basics

Learn:

- types
- interfaces
- type aliases
- enums
- generics
- optional properties

### Resources

- MDN JavaScript Guide:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- TypeScript Handbook:
  https://www.typescriptlang.org/docs/handbook/intro.html

### Goal

Be able to open your teammates' React/NestJS code and understand its general flow.

---

## 7. SQL and PostgreSQL

### Learn these concepts

- relational database
- table
- row
- column
- primary key
- foreign key
- unique constraint
- NOT NULL
- one-to-one
- one-to-many
- many-to-many
- index
- transaction
- constraint

### SQL commands

```sql
SELECT
INSERT
UPDATE
DELETE
JOIN
```

### Example relationship

```text
User
----
id
email
password_hash

Project
-------
id
title
author_id ─────→ User.id
```

### Resource

- PostgreSQL official tutorial:
  https://www.postgresql.org/docs/current/tutorial.html

### Goal

Understand how application data is structured and why database constraints and
transactions matter.

---

## 8. ORM / Prisma

Learn this only after basic SQL.

### Mental model

Without ORM:

```sql
SELECT *
FROM users
WHERE id = 42;
```

With Prisma:

```ts
prisma.user.findUnique({
  where: { id: 42 }
})
```

### Resource

- Prisma getting started:
  https://www.prisma.io/docs/getting-started

### Goal

Understand that an ORM is a layer over the database, not the database itself.

---

# Phase 2 — DevOps foundations

## 9. Docker

### Learn the difference

```text
IMAGE
=
template / packaged filesystem

CONTAINER
=
running instance of an image
```

### Learn

- Dockerfile
- image
- container
- registry
- build
- run
- stop
- remove
- volume
- network
- port mapping
- environment variable
- health check
- Docker Compose

### Commands

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

docker compose up
docker compose down
docker compose logs
docker compose ps
```

### Resources

- Docker Get Started:
  https://docs.docker.com/get-started/
- Docker Compose Quickstart:
  https://docs.docker.com/compose/gettingstarted/
- Play with Docker:
  https://labs.play-with-docker.com/

### Goal

Be able to run multiple application services reproducibly with containers.

---

## 10. Docker networking

### Learn

- bridge network
- service discovery
- service names
- container port
- host port
- published port
- private/internal communication

### Important example

Inside Docker Compose:

```text
backend → postgres:5432
```

is normally correct when `postgres` is the service name.

This:

```text
backend → localhost:5432
```

usually means "connect to the backend container itself", not the PostgreSQL container.

### Resource

- Docker networking:
  https://docs.docker.com/engine/network/

### Goal

Understand which services should be publicly exposed and which should remain internal.

---

## 11. Reverse proxy

Possible choices include Nginx or Caddy.

### Mental model

```text
                  ┌── frontend
Browser → :443 ───┤
                  └── backend
```

Users may see:

```text
https://horizon.local/
https://horizon.local/api/
```

while internally the reverse proxy sends traffic to different containers.

### Learn

- reverse proxy
- upstream
- routing
- proxy headers
- TLS termination
- `proxy_pass` if using Nginx

### Resource

- Nginx beginner guide:
  https://nginx.org/en/docs/beginners_guide.html

### Goal

Understand why the browser can communicate through one public HTTPS entry point while
internal services use private addresses.

---

## 12. HTTPS, TLS, and certificates

### Learn

- HTTP
- HTTPS
- TLS
- certificate
- private key
- public key
- certificate authority
- encryption
- integrity
- authentication
- TLS handshake

### Mental model

```text
HTTP:
Browser ---------- Server

HTTPS:
Browser ══════════ Server
          TLS
```

### Resource

- MDN TLS:
  https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security

### Goal

Understand what HTTPS protects and why private keys must stay secret.

---

# Phase 3 — Application security

## 13. Authentication vs authorization

### Authentication

```text
Who are you?
```

Example:

```text
email + password
       ↓
identity verified
```

### Authorization

```text
What are you allowed to do?
```

Example:

```text
normal user
    ↓
DELETE /admin/users/123
    ↓
403 Forbidden
```

### Resources

- OWASP Security Terminology:
  https://cheatsheetseries.owasp.org/cheatsheets/Security_Terminology_Cheat_Sheet.html
- NestJS Authorization:
  https://docs.nestjs.com/security/authorization

### Goal

Never confuse identity verification with permission checks.

---

## 14. Password security

### Main rule

Never store plaintext passwords.

Learn:

- hashing
- salt
- password hashing algorithm
- why normal fast hashes such as raw SHA-256 are not sufficient for password storage
- Argon2id / bcrypt concepts

### Resource

- OWASP Password Storage Cheat Sheet:
  https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

### Goal

Understand what is stored in the database and how passwords are verified.

---

## 15. Cookies and sessions

### Mental model

```text
login
 ↓
server verifies credentials
 ↓
session created
 ↓
session ID stored in cookie
 ↓
browser sends cookie automatically
 ↓
server recognizes the session
```

### Learn

- session
- cookie
- HttpOnly
- Secure
- SameSite
- session expiration
- logout
- invalidation
- CSRF

### Resource

- OWASP Session Management Cheat Sheet:
  https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

### Goal

Understand how a user stays logged in and how sessions can be stolen or abused.

---

## 16. OWASP Top 10

Start with:

- Broken Access Control
- Authentication Failures
- Injection
- Security Misconfiguration
- Cryptographic Failures
- Security Logging and Alerting Failures

### Resource

- OWASP Top 10:
  https://owasp.org/Top10/

### Goal

Understand real classes of application vulnerabilities, not just their names.

---

## 17. Practical web security

Use PortSwigger Web Security Academy.

Recommended order:

1. SQL injection
2. Authentication
3. Access control
4. File upload vulnerabilities
5. Path traversal
6. Cross-site scripting (XSS)
7. CSRF
8. WebSockets
9. API testing
10. Race conditions

### Resource

- PortSwigger Web Security Academy:
  https://portswigger.net/web-security

Only test systems you own, training labs, or systems where you have explicit permission.

### Goal

Learn by seeing how vulnerable applications actually fail.

---

## 18. Burp Suite

Start with only:

- Proxy
- HTTP history
- Repeater

### Mental model

```text
Browser
   ↓
 Burp
   ↓
Backend
```

### Resource

- PortSwigger Getting Started:
  https://portswigger.net/web-security/getting-started

### Goal

Inspect and modify HTTP requests so you can test Horizon's authorization and validation.

---

## 19. OWASP Juice Shop

An intentionally vulnerable web application for training.

### Resource

- OWASP Juice Shop:
  https://owasp.org/www-project-juice-shop/

### Goal

Combine Docker, HTTP, browser tools, APIs, and practical web security in one safe lab.

---

## 20. Input validation and file uploads

Horizon may use avatars and project media, so this matters directly.

### Learn

- server-side validation
- allowlists
- MIME checking
- extension checking
- file size limits
- generated filenames
- access control
- storage isolation
- cleanup

### Resource

- OWASP File Upload Cheat Sheet:
  https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

### Goal

Understand why checking only a filename extension is not enough.

---

## 21. Secret management

### Secrets include

- database passwords
- session secrets
- OAuth secrets
- API keys
- private keys
- TLS private keys
- Vault tokens

### Rules

```text
.env.example with fake values ✅
.env with real secrets in Git ❌
frontend bundle containing secrets ❌
secrets written to logs ❌
```

### Resource

- OWASP Secrets Management Cheat Sheet:
  https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

### Goal

Understand why configuration and secrets must be handled separately.

---

## 22. Docker security

### Learn

- least privilege
- non-root containers
- unnecessary capabilities
- read-only filesystems where practical
- avoid unnecessary published ports
- do not expose Docker socket
- image updates
- secret handling

### Resource

- OWASP Docker Security Cheat Sheet:
  https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html

### Goal

Know how a normal working container can still be insecure.

---

# Phase 4 — CI/CD and operations

## 23. GitHub Actions / CI

### Mental model

```text
git push
   ↓
GitHub Actions
   ↓
install
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

### Learn

- workflow
- event
- job
- step
- runner
- artifact
- secret

### Resource

- GitHub Actions Quickstart:
  https://docs.github.com/en/actions/get-started/quickstart

### Goal

The first CI pipeline should answer:

> Does this commit build and do its tests pass?

Do not start with complicated deployment pipelines.

---

## 24. Health checks

Example:

```http
GET /health
```

Possible response:

```json
{
  "status": "ok"
}
```

Later:

```text
API       ✅
Database  ✅
Storage   ✅
```

### Goal

Understand the difference between a process that is running and a service that is healthy.

---

## 25. Metrics, logs, and traces

### Metric

```text
requests_total = 19391
```

### Log

```text
ERROR login failure request_id=123
```

### Trace

```text
request
 ↓
backend
 ↓
database
 ↓
storage
```

### Goal

Understand which kind of observability data answers which question.

---

## 26. Prometheus

Prometheus collects metrics.

```text
Application /metrics
        ↑
        │ scrape
        │
   Prometheus
```

### Learn

- metric
- counter
- gauge
- histogram
- labels
- target
- scraping
- basic PromQL

### Resource

- Prometheus First Steps:
  https://prometheus.io/docs/introduction/first_steps/

### Goal

Collect useful application and infrastructure metrics.

---

## 27. Grafana

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

Potential Horizon metrics:

- requests per second
- response latency
- HTTP 5xx count
- active WebSocket connections
- login failures
- CPU
- memory
- database connections

### Resource

- Grafana Getting Started:
  https://grafana.com/docs/grafana/latest/fundamentals/getting-started/

### Goal

Build dashboards that actually help diagnose the system.

---

## 28. Logging

Bad:

```text
error
```

Better:

```json
{
  "level": "error",
  "event": "login_failure",
  "requestId": "123",
  "timestamp": "...",
  "reason": "invalid_credentials"
}
```

Never log:

- passwords
- session tokens
- authentication cookies
- API secrets
- private keys

### Resource

- OWASP Logging Cheat Sheet:
  https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

### Goal

Create useful structured logs without leaking sensitive information.

---

## 29. ELK

### Components

```text
Application logs
      ↓
   Logstash
      ↓
Elasticsearch
      ↓
    Kibana
```

Think of them as:

- Logstash = collect / transform
- Elasticsearch = store / index / search
- Kibana = visualize / search / dashboards

### Resource

- Elastic Stack fundamentals:
  https://www.elastic.co/docs/get-started/the-stack

### Goal

Centralize logs and make them searchable and useful.

---

## 30. Backups and disaster recovery

A backup is only useful if it can be restored.

### Learn

- PostgreSQL dump
- restore
- volume backup
- retention
- recovery procedure
- RPO
- RTO

### Practical goal

Be able to demonstrate:

```text
create data
   ↓
backup
   ↓
remove test data
   ↓
restore
   ↓
verify data returned
```

---

# Phase 5 — Advanced security modules

## 31. HashiCorp Vault

Learn Vault only after understanding normal secret handling.

### Problem

```text
Backend needs database password.

Where should that password live?
```

### Vault model

```text
Vault
  ↓
authenticated application
  ↓
secret
  ↓
backend
```

### Learn

- Vault server
- client
- token
- secret
- secrets engine
- policy
- authentication method
- lease
- rotation

### Resource

- HashiCorp Vault tutorials:
  https://developer.hashicorp.com/vault/tutorials/get-started

### Goal

Understand how applications obtain secrets without hardcoding them.

---

## 32. WAF / ModSecurity

### Mental model

```text
Internet
   ↓
WAF / ModSecurity
   ↓
Reverse Proxy
   ↓
Application
```

A WAF is additional protection.

It does **not** replace:

- authentication
- authorization
- input validation
- secure sessions
- database security

### Resources

- ModSecurity:
  https://github.com/owasp-modsecurity/ModSecurity
- OWASP Core Rule Set:
  https://coreruleset.org/

### Goal

Understand how suspicious HTTP traffic can be detected or blocked before reaching the
application.

---

## 33. NestJS security

Learn this alongside the real backend once it exists.

### Important concepts

- Module
- Controller
- Service
- DTO
- Pipe
- Guard
- Middleware
- Interceptor
- authentication
- authorization

### Resources

- Authentication:
  https://docs.nestjs.com/security/authentication
- Authorization:
  https://docs.nestjs.com/security/authorization
- Encryption and hashing:
  https://docs.nestjs.com/security/encryption-and-hashing

### Goal

Be able to follow how Horizon's backend enforces authentication and permissions.

---

## 34. WebSockets

### Difference from HTTP

HTTP:

```text
request
 ↓
response
 ↓
connection can finish
```

WebSocket:

```text
Client ═════════ Server
      persistent
      connection
```

### Security questions

- Who authenticated this socket?
- Which rooms may this user join?
- Can User A subscribe to User B's private conversation?
- Are incoming messages validated?
- What happens after reconnect?
- Can events be duplicated?

### Resource

- MDN WebSocket API:
  https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API

### Goal

Understand both real-time communication and its authorization risks.

---

## 35. Microservices

Do not prioritize this now.

A modular monolith is currently the simpler Horizon direction.

Microservices introduce additional concerns:

- service boundaries
- service discovery
- inter-service authentication
- distributed failures
- message queues
- distributed transactions
- observability
- independent deployment

Study this only if the team later decides to claim the microservices module.

---

# Recommended learning order for Horizon

## Start now

```text
Linux
  ↓
Networking
  ↓
HTTP
  ↓
Git
  ↓
Web application architecture
  ↓
JavaScript / TypeScript basics
  ↓
SQL / PostgreSQL
  ↓
Docker
  ↓
Docker networking
  ↓
Reverse proxy
  ↓
HTTPS / TLS
  ↓
Authentication vs Authorization
```

## Then, when the backend exists

```text
Passwords
  ↓
Sessions / cookies
  ↓
OWASP Top 10
  ↓
PortSwigger labs
  ↓
Burp Suite
  ↓
File upload security
  ↓
Secret management
  ↓
Docker security
```

## Then, when the application can run

```text
GitHub Actions
  ↓
Health checks
  ↓
Prometheus
  ↓
Grafana
  ↓
Structured logging
  ↓
ELK
  ↓
Backups / restore
```

## Finally

```text
Vault
  ↓
ModSecurity / WAF
  ↓
Advanced hardening
```

---

# Core bookmark list

| Topic | Resource |
| --- | --- |
| Linux | https://ubuntu.com/tutorials/command-line-for-beginners |
| Git | https://git-scm.com/learn |
| HTTP | https://developer.mozilla.org/en-US/docs/Web/HTTP |
| JavaScript | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide |
| TypeScript | https://www.typescriptlang.org/docs/handbook/intro.html |
| PostgreSQL | https://www.postgresql.org/docs/current/tutorial.html |
| Prisma | https://www.prisma.io/docs/getting-started |
| Docker | https://docs.docker.com/get-started/ |
| Docker Compose | https://docs.docker.com/compose/gettingstarted/ |
| Docker Networking | https://docs.docker.com/engine/network/ |
| Nginx | https://nginx.org/en/docs/beginners_guide.html |
| TLS / HTTPS | https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security |
| OWASP Top 10 | https://owasp.org/Top10/ |
| OWASP Cheat Sheets | https://cheatsheetseries.owasp.org/ |
| PortSwigger Academy | https://portswigger.net/web-security |
| OWASP Juice Shop | https://owasp.org/www-project-juice-shop/ |
| GitHub Actions | https://docs.github.com/en/actions/get-started/quickstart |
| Prometheus | https://prometheus.io/docs/introduction/first_steps/ |
| Grafana | https://grafana.com/docs/grafana/latest/fundamentals/getting-started/ |
| Elastic Stack | https://www.elastic.co/docs/get-started/the-stack |
| Vault | https://developer.hashicorp.com/vault/tutorials/get-started |
| ModSecurity | https://github.com/owasp-modsecurity/ModSecurity |
| OWASP CRS | https://coreruleset.org/ |
| NestJS Auth | https://docs.nestjs.com/security/authentication |
| NestJS Authorization | https://docs.nestjs.com/security/authorization |
| WebSockets | https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API |

---

# Project-specific rule

Do not learn tools only for the sake of learning tools.

For every topic, connect it to Horizon:

- networking → how containers communicate
- HTTP → how React talks to NestJS
- SQL → how Horizon stores users/projects/messages
- Docker → reproducible one-command startup
- HTTPS → encrypted browser/backend traffic
- authentication → identifying users
- authorization → protecting private/admin resources
- Prometheus → measuring the system
- Grafana → visualizing metrics
- ELK → investigating logs
- Vault → protecting secrets
- ModSecurity → filtering malicious HTTP traffic

The final goal is not to say "I used these technologies."

The goal is to be able to explain:

> what problem each technology solves, how Horizon uses it, what would happen without it,
> how it is configured, and how we verified that it works.
