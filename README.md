# Nilvee Engineering Agency — Core API Engine

Production-ready, highly secure, and performance-optimized backend architecture for the Nilvee Engineering Agency platform.

## 🛠️ Technology Stack Matrix
* **Runtime Core**: Node.js v22+ (ECMAScript Modules)
* **API Framework**: Fastify v5 (High-velocity, low-overhead router)
* **Data Access**: Prisma ORM with native PostgreSQL connection pooling
* **Validation**: Zod (Runtime type-safety and type provider schema compilation)
* **Testing Suite**: Native Node.js test runner (`node:test`)

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies
Ensure you have `pnpm` installed on your machine, then run:
```bash
pnpm install
```

### 2. Configure Environment Context Variables
Copy the non-sensitive example reference configuration layout file to establish your local operational environment variables:
```bash
cp .env.example .env
```
*Open `.env` and fill in your local system credentials, PostgreSQL credentials, and high-entropy JWT cryptographic keys.*

### 3. Initialize Database Migrations
Synchronize your local PostgreSQL database structure and generate the native type-safe client models:
```bash
pnpm db:migrate
```

### 4. Fire up the Development Engine
Launch the project using high-speed atomic rebuild loops:
```bash
pnpm dev
```
The server will initialize and establish a network socket listener at `http://localhost:3000`.

---

## 🧪 Quality Assurance & Operational Verification Scripts

Maintain code metrics and verify endpoint boundaries using these unified package helper scripts:

```bash
# Validate code integrity using strict TypeScript type-checking rules
pnpm typecheck

# Automatically capture and fix standard linter style warnings
pnpm lint

# Format the entire codebase structure cleanly using Prettier standard spacing rules
pnpm format

# Execute the native automated integration test suite against the live database
pnpm test

# Re-compile raw TypeScript source trees into standalone production JavaScript artifacts
pnpm build
```

---

## 🌐 Dynamic API Documentation & Contract Points

* **Interactive OpenAPI/Swagger Interface Portal**: Boot your server locally and open `http://localhost:3000/docs` inside your web browser to access live "Try it out" sandboxes.
* **Frontend Developer Integration Blueprint**: Refer to `API_CONTRACT.md` located in the workspace repository root directory for structured requests, metadata responses, error definitions, and authentication header rules.

---

## 🐳 Containerized Production Deployments

The engine is pre-configured to execute zero-network runtime builds using localized compilation artifacts directly from your development machine.

### The Immutable Delivery Routine:
```bash
# 1. Clear out old historical build distribution trails
rm -rf dist

# 2. Compile clean, minimized production-ready JS files
pnpm build

# 3. Boot up the hardened Docker container environment in the background
docker compose up --build -d
```
# Production Release Synchronization v1.0.0
