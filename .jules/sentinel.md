## 2025-10-26 - Hardcoded Firebase Credentials in Fallback Config
**Vulnerability:** The `src/services/firebase.js` file contained a `FALLBACK_CONFIG_RAW` object with hardcoded Firebase API keys and project configuration. This was intended as a fallback if environment variables were missing.
**Learning:** Developers often add fallback configurations for convenience during local development, but this practice risks exposing secrets if the code is committed. It also bypasses environment-based configuration management.
**Prevention:** Always enforce strict environment variable checks. If required variables are missing, the application should fail fast and securely (e.g., throw an error) rather than silently using insecure hardcoded defaults. Never commit "fallback" secrets to source control.

## 2025-10-26 - Hardcoded Admin Password
**Vulnerability:** The `src/utils/constants.js` file contained a hardcoded admin password (`ADMIN_PASSWORD = '...'`).
**Learning:** Storing passwords in plaintext within the source code makes them accessible to anyone with read access to the repository.
**Prevention:** Move all sensitive secrets, including passwords and API keys, to environment variables (e.g., `.env`) which are not committed to version control.

## 2025-10-26 - Committing .env Files
**Vulnerability:** The `.env` file containing secrets (API keys, passwords) was being tracked by git because it was missing from `.gitignore`.
**Learning:** Even if you use environment variables, committing the `.env` file defeats the purpose by exposing those secrets to the repository history.
**Prevention:** Always add `.env` (and variations like `.env.local`) to `.gitignore` *before* creating the file. If accidentally committed, remove it from the index immediately using `git rm --cached .env`.
