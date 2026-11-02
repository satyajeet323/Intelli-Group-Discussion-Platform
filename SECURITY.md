# Security Policy

## 🛡️ Overview

The **INTELLIBOT (Intelli-Group-Discussion-Platform)** team takes the security and privacy of our users, contributors, and systems seriously. We appreciate the responsible disclosure of any vulnerabilities found in this repository.

This document outlines our security policies, supported versions, and how to report security vulnerabilities responsibly.

---

## 📦 Supported Versions

Security updates and patches are actively applied to the following versions of the project:

| Version | Supported          | Status             |
| ------- | ------------------ | ------------------ |
| `1.x.x` (current / `main`) | :white_check_mark: | Actively supported |
| `< 1.0.0`                  | :x:                | End of Life (EOL)  |

We strongly encourage running the latest commit or release on the default branch to ensure all current security patches and dependency updates are applied.

---

## 🚨 Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Publicly disclosing a vulnerability can put all users and instances of the platform at risk before a fix is available.

### Preferred Method: GitHub Private Vulnerability Reporting

1. Navigate to the repository's **[Security Tab](https://github.com/satyajeet323/Intelli-Group-Discussion-Platform/security)**.
2. Select **[Report a vulnerability](https://github.com/satyajeet323/Intelli-Group-Discussion-Platform/security/advisories/new)** to open a private advisory draft.
3. Fill out the advisory form with the vulnerability details.

### Alternative Method: Email

If you cannot use GitHub Advisories, please contact the repository maintainer directly:

- **Contact:** Satyajeet S. Desai
- **Email:** [sattudesai007@gmail.com](mailto:sattudesai007@gmail.com)
- **Subject line:** `[SECURITY VULNERABILITY] Intelli-GD - <Brief Summary>`

---

## 📋 What to Include in Your Report

To help us triage and resolve the issue quickly, please include as much of the following information as possible:

1. **Description:** Clear explanation of the vulnerability and its potential impact.
2. **Affected Component(s):**
   - Frontend (`client/`)
   - Backend API & WebSocket Signaling (`server/`)
   - AI / ML Backend (`ml-server/`)
   - Authentication & Session Management (JWT, bcrypt)
3. **Reproduction Steps:** Step-by-step instructions or a minimal Proof of Concept (PoC) script.
4. **Environment:** OS, Node.js version, browser version, and dependency versions if relevant.
5. **Mitigation Suggestion:** Any proposed patch or fix (optional but appreciated).

---

## ⏱️ Response Timelines

When you report a vulnerability, we commit to the following response targets:

- **Initial Acknowledgement:** Within **48 hours** of receiving your report.
- **Triage & Assessment:** Within **5 business days**, confirming whether the issue is reproducible and determining its severity.
- **Fix & Patch Development:** We aim to release a patch as quickly as possible, typically within **14–30 days** depending on complexity.
- **Public Disclosure:** Coordinated with the reporter after a fix has been tested and released.

---

## 🔒 Security Guidelines for Deployers & Contributors

When deploying or contributing to this platform, ensure you follow these essential security practices:

### 1. Secrets & Environment Variables
- **Never commit `.env` files** or hardcode secrets into the source code.
- Always configure unique and strong values for:
  - `JWT_SECRET`
  - `MONGO_URI`
  - `GEMINI_API_KEY`
  - `GROQ_API_KEY`
- Store credentials in secure secret managers or server environment configurations.

### 2. WebSocket & WebRTC Security
- Ensure signaling messages are validated and only authenticated users can join rooms.
- Do not transmit sensitive participant data across unencrypted channels.

### 3. Dependencies
- Regularly audit dependencies for known vulnerabilities:
  ```bash
  # Client
  cd client && npm audit

  # Server
  cd ../server && npm audit
  ```

---

## 🚫 Out of Scope

The following types of issues are generally considered out of scope:

- Denial of Service (DoS / DDoS) attacks against hosted instances.
- Social engineering, phishing, or physical attacks against maintainers or users.
- Automated scanner reports without a verifiable Proof of Concept or demonstrated security impact.
- Attacks requiring physical access to an unlocked, already-compromised user device.
- Public rate-limiting on demo instances without privilege escalation or data leakage.

---

## 🏅 Hall of Fame & Acknowledgement

We believe in recognizing security researchers who help keep open source safe. If you responsibly disclose a valid security vulnerability, we will gladly credit you in the release notes and security advisory (unless you request to remain anonymous).

Thank you for helping keep **INTELLIBOT** secure!
