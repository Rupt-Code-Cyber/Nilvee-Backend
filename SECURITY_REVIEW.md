# Nilvee Backend Engine — Practical Security Review Manifest

This document records the exact security postures verified across the application codebase.

## 🛡️ Completed Vulnerability Assessments Checklist

* **Secrets & Credentials Leakage**: **Verified.** No plaintext passwords or connection strings are hardcoded into source code, migrations, or seed assets. All dynamic targets use environment configuration maps.
* **Administrative Cryptographic Storage**: **Verified.** Admin passphrases run through a robust hashing function (`bcryptjs`) before hit database writes. No raw string records exist on disk.
* **JWT Signature Isolation**: **Verified.** Token signing signatures depend completely on `process.env.JWT_SECRET`. Claims vectors track minimal parameters (`sub`, `email`) with an 8h expiration deadline.
* **Sensitive Metrics Obfuscation Logs**: **Verified.** The logging layer blocks `Authorization` headers, credentials, and raw passwords from hit standard PINO stream outputs.
* **Boundary Validation & Anti-Spam Protections**: **Verified.** Public incoming routes (`POST /orders`, `POST /inquiries`) are locked to a strict limit of 10 requests per minute with body limits set to a safe maximum size of 128 KB to mitigate memory allocation exploits.
* **CORS Network Restrictions**: **Verified.** Development wildcards (`*`) are isolated. Production setups require strict matching parameters passed through `process.env.CORS_ORIGIN`.
* **SQL Injection Vector Mitigation**: **Verified.** Database inputs leverage type-safe parameterized abstractions natively provided by the Prisma client layer. No direct unsanitized concatenated query execution strings exist.
* **Resource Isolation Verification**: **Verified.** Administrative routes require a validated authentication token step. Unauthenticated access immediately fails with an immediate HTTP 401 response code.
