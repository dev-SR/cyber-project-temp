# Academic Project Report: JWT-like Token Issuing SaaS

Date: 2025-11-29

Author: Project Team

Affiliation: [Department / Institution]

Version: 1.1

---

## Abstract
This report documents the design, implementation, and evaluation of a pedagogical, full‑stack Next.js application that issues JWT‑like tokens secured via classical ciphers. The prototype demonstrates end‑to‑end token generation, storage, verification, and tier‑based feature gating (Free/Basic/Premium) across Analytics, Content, and Reports. Each token segment is protected by a distinct algorithm—Group Substitution (header), Vigenère (payload), and Transposition (signature)—implemented from first principles to maximize educational value. The system integrates a simulated payment flow (with optional Stripe) and showcases Diffie‑Hellman key exchange to illustrate secure key establishment. We present formal requirements using FURPS+, evaluate implementation alternatives, justify architectural decisions, and provide a comprehensive test plan and report. The resulting system offers a reproducible reference for teaching cryptography concepts, token‑based access control, and SaaS subscription models.

## Keywords
JWT; classical cryptography; Vigenère; transposition cipher; group substitution; Next.js; SaaS; subscription tiers; access control; Diffie‑Hellman

## Acknowledgements
We thank the open‑source community and the maintainers of Next.js, Tailwind CSS, and shadcn/ui for the tools that enabled rapid prototyping. We also acknowledge reviewers and instructors for feedback that improved the clarity and rigor of this report.

## Nomenclature and Acronyms
- JWT — JSON Web Token (used analogously in this educational context)
- DH — Diffie‑Hellman key exchange
- UI/UX — User Interface / User Experience
- FURPS+ — Functionality, Usability, Reliability, Performance, Supportability (+Security, etc.)
- API — Application Programming Interface

## List of Figures
- Figure 1. System architecture overview (assets/screenshots/architecture_overview.png)
- Figure 2. Token life‑cycle and crypto flow (assets/screenshots/token_lifecycle.png)
- Figure 3. Dashboard with tier gating (assets/screenshots/dashboard_tiers.png)
- Figure 4. Feature pages (analytics/content/reports) (assets/screenshots/feature_pages.png)

## List of Tables
- Table 1. FURPS+ quality attribute specification
- Table 2. Feature matrix by subscription tier
- Table 3. Test cases and expected outcomes

---

## Table of Contents
- Abstract
- Keywords
- Acknowledgements
- Nomenclature and Acronyms
- List of Figures
- List of Tables
- 0. Programming Task 2 Implementation — Consolidated Overview
- 1. Written Summary of Task
- 2. Requirement Specification
  - 2.1 Use-case
  - 2.2 FURPS+
    - 2.2.1 Functionality
    - 2.2.2 Usability
    - 2.2.3 Reliability
    - 2.2.4 Performance
    - 2.2.5 Supportability
    - 2.2.6 Security
- 3. Evaluation of Implementation Options
- 4. Overview of Selected Solution
  - 4.1 System Architecture
  - 4.2 Encryption and Decryption Design
  - 4.3 System Design
- 5. Test Plan
- 6. Implementation
- 7. Test Report
- 8. Conclusion
- 9. References
- Appendix A. Supplementary Materials

---

## 0. Programming Task 2 Implementation — Consolidated Overview

Date: 2025-11-29  
Version: 1.0  
Subject: Cryptography & System Design  
Repository: JWT-like Token Issuing SaaS

0.1 Assignment Mapping & Task Overview
- Requirement: Implement at least three methods from “homework practice topics,” each with Encrypt & Decrypt; provide a compact report. Bonus credit for Diffie–Hellman key exchange.
- Selected methods (implemented from scratch):
  - Group Substitution Cipher — Header encryption (Encrypt & Decrypt)
  - Vigenère Cipher — Payload encryption (Encrypt & Decrypt)
  - Transposition (Columnar) Cipher — Signature/integrity (Encrypt & Decrypt)
  - Bonus: Diffie–Hellman (DH) key exchange — parameter generation and shared secret computation

0.2 Token Structure and Lifecycle
- Structure: [Base64(GroupSub(header))].[Base64(Vigenère(payload))].[Base64(Transposition(signatureData))]
- Signature input: signatureData = encodedHeader + "." + encodedPayload
- Lifecycle:
  1) Issuance on login/register → token persisted to localStorage under 'token' (with user under 'user')
  2) Verification on access → decrypt signature (Transposition) and compare; decrypt payload (Vigenère), check exp
  3) Decoding for UI → decrypt header (Group Substitution) and payload (Vigenère) to visualize contents
  4) Renewal → login or successful upgrade regenerates token and emits window.dispatchEvent(new Event('tokenUpdated'))

0.3 Cryptographic Methods (Implementation Details)
- Group Substitution (Header)
  - Idea: Each character maps to a grouped token like H → "S+SS"; groups joined with '|'. Unknowns fallback to literal-first form.
  - Decrypt: Split on '|', reverse-map each group; if unknown, take substring before '+'.
  - Files: lib/crypto/groupSubstitution.js; used by lib/token.js (createToken/decodeToken) and app/page.js decoder demo.
- Vigenère (Payload)
  - Alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?-_"
  - Key: SECRETKEY (demo default)
  - Encrypt: shift each plaintext char index by key char index modulo |alphabet|; decrypt subtracts with wrap-around.
  - Files: lib/crypto/vigenere.js; used by lib/token.js (createToken/verifyToken/decodeToken) and app/page.js demo.
- Transposition (Signature)
  - Key: "34152"; width = 5; row-wise fill with optional 'X' padding; read columns by ascending key digits for encryption; inverse for decryption.
  - Purpose: Bind header and payload together for integrity; decrypt(signature) must equal encodedHeader+"."+encodedPayload.
  - Files: lib/crypto/transposition.js; used by lib/token.js (createToken/verifyToken) and app/page.js verification demo.
- Diffie–Hellman (Bonus)
  - Demo parameters: P=23, G=5; A=G^a mod P, B=G^b mod P; shared secret S = B^a ≡ A^b (mod P).
  - Files: lib/crypto/diffieHellman.js; surfaced in Dashboard → Diffie–Hellman tab.

0.4 Authentication, Authorization, and Permissions (AAA)
- Authentication: /api/register and /api/login create tokens via lib/token.js → createToken; store in localStorage; dispatch 'tokenUpdated'.
- Authorization: lib/token.js → verifyToken splits token, decrypts signature (Transposition), recomputes expected input, decrypts payload (Vigenère), validates exp.
- Permissions: lib/accessControl.js defines FEATURES and FEATURE_DETAILS; components/ProtectedFeature.jsx verifies token at runtime and conditionally renders UI; listens for 'tokenUpdated', 'storage', and 'visibilitychange' to sync across tabs.
- Pages: app/dashboard/page.js, app/features/*, app/subscription/page.js integrate the gating model.

0.5 Testing & Validation
- Unit: test_encryption.js validates encrypt/decrypt for Group Substitution, Vigenère, Transposition, and DH equality (A^b mod P == B^a mod P).
- Integration: backend_test.py covers registration/login, payment upgrades (/api/payment), and verification (/api/verify).
- Results: See test_result.md and README (16/16 API tests passed). Tampering and expiry cases correctly rejected.

0.6 Implementation Details by File (Mapping)
- lib/crypto/groupSubstitution.js — group maps + invertible decrypt
- lib/crypto/vigenere.js — ALPHABET, encrypt(text,key), decrypt(text,key)
- lib/crypto/transposition.js — encrypt(text,keyDigits), decrypt(text,keyDigits)
- lib/crypto/diffieHellman.js — generate, shared secret
- lib/token.js — base64 helpers; createToken(payload), verifyToken(token), decodeToken(token)
- lib/accessControl.js — FEATURES, FEATURE_DETAILS, hasFeatureAccess, verifyUserToken
- components/ProtectedFeature.jsx — runtime verification and conditional rendering
- app/page.js — interactive decoder (Group Substitution/Vigenère/Transposition)
- app/dashboard/page.js — subscription management, token display, DH tab, 'Manage Subscription' CTA
- app/subscription/page.js — upgrade flow; updates token + user and broadcasts 'tokenUpdated'
- app/features/* — Analytics/Content/Reports pages demonstrating tier-based functionality

0.7 Educational Security Scope & Limitations
- Classical ciphers offer transparency but are not secure; do not use in production.
- LocalStorage chosen for pedagogy; production should use HTTP-only cookies and modern cryptography (HMAC/JWS or JOSE with RS/ES keys).
- Time-based expiry is enforced; no issuer/audience claims validated in this demo.

---

## 1. Written Summary of Task
The objective is to design and implement an educational, full‑stack Next.js web application that demonstrates a JWT‑like token system using classical cryptographic algorithms implemented from scratch. The application issues tokens with a header, payload, and signature, each protected by distinct ciphers (Group Substitution, Vigenère, Transposition). A subscription model (Free, Basic, Premium) governs access to SaaS features across Analytics, Content, and Reports. The system includes a demo payment flow and optional Stripe integration, plus a Diffie‑Hellman (DH) key exchange demonstration for pedagogical purposes.

This documentation presents formal requirements (FURPS+), evaluates design options, details the chosen architecture and cryptographic designs, and provides a comprehensive test plan, implementation walkthrough (with screenshot placeholders), and test report.

---

## 2. Requirement Specification

### 2.1 Use‑case
- Title: Token‑gated SaaS features with subscription tiers
- Primary Actor: Authenticated User
- Stakeholders: End users, instructors, developers, curriculum authors
- Preconditions:
  - User can register and log in to obtain a token
  - Browser supports LocalStorage (or cookies) for token persistence
- Triggers:
  - User navigates to Dashboard or Feature pages
  - User upgrades plan via Demo or Stripe payment
- Main Success Scenario:
  1. User logs in and receives a token created with custom ciphers
  2. User opens Dashboard and sees their current subscription tier and token
  3. User navigates to feature pages; gated components render according to tier
  4. User upgrades plan; token and local user object are updated
  5. UI across tabs reacts immediately to token change (tokenUpdated event)
- Alternate Flows:
  - A1: Token expired → user is redirected to /auth
  - A2: Invalid signature → features are hidden/disabled; verification fails
  - A3: Network error on payment → upgrade fails gracefully with error message
- Postconditions:
  - User state persists across sessions
  - Feature access is consistent with the tier encoded in the token payload

### 2.2 FURPS+

#### 2.2.1 Functionality
- Implement custom ciphers:
  - Group Substitution for header
  - Vigenère for payload
  - Transposition for signature
- JWT‑like token structure: header.payload.signature (Base64 per part)
- Subscription tiers governing features (Free, Basic, Premium)
- Feature pages: /features/analytics, /features/content, /features/reports with conditional rendering
- Dashboard: token display, tier management, Manage Subscription CTA
- Payment: Demo payment (always available) and Stripe payment (optional)
- Access control utilities and ProtectedFeature component for runtime gating
- DH key exchange demo (bonus educational component)

#### 2.2.2 Usability
- Modern, accessible UI with consistent theming (dark mode)
- Clear Locked/Unlocked states and upgrade prompts
- Immediate feedback on subscription changes (no manual reload)
- User guide and documentation for onboarding

#### 2.2.3 Reliability
- Signature verification using Transposition cipher to detect tampering
- Expiration embedded in payload (iat/exp) and enforced during verification
- Graceful handling of invalid tokens and network failures
- Deterministic in‑browser encryption with controlled alphabets/keys

#### 2.2.4 Performance
- Lightweight algorithms suitable for client‑side execution
- No large dependencies for cryptography
- LocalStorage access amortizes latency; rendering is componentized

#### 2.2.5 Supportability
- Plain JavaScript implementation for ciphers with clear modular boundaries (lib/crypto)
- Self‑contained Next.js project with documented structure
- Test scripts for encryption and API flows
- Readable configuration and default keys; easy to swap implementations

#### 2.2.6 Security
- Educational focus: classical ciphers (not production‑grade security)
- Signature verification to prevent naive tampering
- Token lifetime (exp) to limit exposure window
- Storage in LocalStorage is acceptable for the educational context; document risks
- Stripe integration optional; demo payment avoids storing sensitive data
- Guidance provided to use modern crypto in production

---

## 3. Evaluation of Implementation Options
- Token Format
  - Option A: Standard JWT with HS/RS algorithms (production‑grade)
  - Option B: Custom JWT‑like format with educational ciphers (chosen for pedagogy)
  - Rationale: Demonstrate classical cryptography end‑to‑end while mimicking JWT ergonomics
- Cryptography
  - Option A: Use Node/Web Crypto APIs (secure, opaque to learners)
  - Option B: Implement Group Substitution, Vigenère, Transposition from scratch (chosen)
  - Rationale: Transparency and step‑by‑step understanding of cipher mechanics
- Access Control
  - Option A: Server‑side middleware/edge functions
  - Option B: Client‑side runtime gating with explicit verification utilities (chosen)
  - Rationale: Immediate visual feedback and simpler demo flow without backend coupling
- Storage
  - Option A: Cookies (HTTP‑only) with SSR checks
  - Option B: LocalStorage with client‑side verification (chosen for simplicity)
- Payments
  - Option A: Stripe only
  - Option B: Demo payment with optional Stripe (chosen for accessibility and zero setup)
- Real‑time Sync
  - Option A: Polling or global state library
  - Option B: Lightweight custom events (tokenUpdated), storage and visibility listeners (chosen)

---

## 4. Overview of Selected Solution

### 4.1 System Architecture
- Frontend Framework: Next.js
- UI: Tailwind CSS + shadcn/ui components
- Data Flow:
  1. User logs in → backend returns token
  2. Token stored in LocalStorage → /dashboard and features consume it
  3. Access control uses verifyToken/decodeToken (lib/token.js + lib/accessControl.js)
  4. Upgrades via /api/payment update token + user in LocalStorage → dispatch tokenUpdated
- Key Modules and Files:
  - lib/crypto/groupSubstitution.js — header cipher
  - lib/crypto/vigenere.js — payload cipher
  - lib/crypto/transposition.js — signature cipher
  - lib/token.js — createToken, verifyToken, decodeToken
  - lib/accessControl.js — tier features, verification helpers, mapping
  - components/ProtectedFeature.jsx — runtime gating + event listeners
  - app/dashboard/page.js — token display, subscription management, DH tab
  - app/features/* — tier‑gated features (analytics, content, reports)
  - app/subscription/page.js — upgrade flow and feature listing

Architecture Style: Client‑heavy demo app with lightweight API routes. The cryptographic path is transparent and intentionally non‑secure to illuminate algorithmic steps.

### 4.2 Encryption and Decryption Design
- Group Substitution Cipher (Header)
  - Static mapping of characters → grouped strings (e.g., H → S+SS)
  - Implemented for deterministic, reversible obfuscation of header JSON
- Vigenère Cipher (Payload)
  - Alphabet: `A–Z a–z 0–9 space and punctuation (.,;:!?-_)`
  - Default key: SECRETKEY
  - Shifts over custom alphabet to produce cipher text of the payload JSON
- Transposition Cipher (Signature)
  - Default key: 34152; generates a columnar mapping
  - Signature = encrypt(Base64(header).".".Base64(payload))
  - Verification decrypts signature and compares to expected concatenation
- Token Composition
  - Each encrypted part is Base64 encoded (padding stripped) and joined with '.'
  - Payload includes iat and exp for lifetime control

Security Note: These algorithms are for educational demonstration only and are not resistant to modern cryptanalysis; do not use in production.

### 4.3 System Design
- Access Model
  - Tier → feature mapping defined in lib/accessControl.js
  - hasFeatureAccess, getAllFeaturesWithAccess utilities centralize policy
  - ProtectedFeature reads token, verifies, and conditionally renders children
- State Synchronization
  - subscription changes broadcast with window.dispatchEvent(new Event('tokenUpdated'))
  - Components listen to storage and visibilitychange for cross‑tab consistency
- Subscription Flow
  - /subscription provides tier selection and payment method choice
  - /api/payment returns new token; user and token persisted; UI updates immediately

---

## 5. Test Plan
- Unit Tests
  - Cipher correctness: known‑answer tests for group substitution, Vigenère, Transposition
  - Token utility tests: createToken → verifyToken(true); tampered token → verifyToken(false)
- Integration Tests
  - Authentication: registration → login → token issuance
  - Payment API: demo payment upgrade path; error handling
  - Access gating: simulate tiers and assert component visibility
- Regression Tests
  - Token expiration and signature checks
  - Eventing (tokenUpdated) triggers UI refresh
- Performance/Load (lightweight)
  - Measure token creation/verification within typical UI interaction bounds
- Security (educational scope)
  - Ensure no plaintext token parts are rendered unless explicitly decoded by user
  - Validate signature mismatch blocks access
- Test Artifacts
  - test_encryption.js (local cipher tests)
  - backend_test.py (API/flow tests)
  - test_result.md (summary output)

---

## 6. Implementation
This section summarizes the implementation and provides placeholders for screenshots to be collected during demonstration or QA.

### 6.1 Repository Layout
- app/ — Next.js pages (home, dashboard, subscription, features/*)
- components/ — UI and gating (ProtectedFeature)
- lib/ — Token utilities and ciphers (groupSubstitution, vigenere, transposition)
- tests/ — Additional tests
- test_encryption.js — Cipher tests
- backend_test.py — API tests

### 6.2 Key Flows
- Token Creation: lib/token.js → createToken(payload)
- Token Verification: lib/token.js → verifyToken(token)
- Access Control: lib/accessControl.js + components/ProtectedFeature.jsx
- Subscription Upgrade: app/subscription/page.js and app/dashboard/page.js → /api/payment

### 6.3 Screenshot Placeholders (to be captured)
- ![Screenshot Placeholder — Home: Token Decoder](assets/screenshots/home-token-decoder.png)
  - Context: Decoding header, payload, signature; feature list by tier
- ![Screenshot Placeholder — Dashboard: Account & Token](assets/screenshots/dashboard-account-token.png)
  - Context: Current plan badge, raw token display, copy button
- ![Screenshot Placeholder — Dashboard: Features Overview](assets/screenshots/dashboard-features-overview.png)
  - Context: Tier‑gated feature cards with Manage Subscription CTA
- ![Screenshot Placeholder — Subscription: Plan Selection](assets/screenshots/subscription-plan-selection.png)
  - Context: Tiers grid, radio selection for payment method, upgrade button
- ![Screenshot Placeholder — Features: Analytics](assets/screenshots/features-analytics.png)
  - Context: Free/Basic/Premium sections with ProtectedFeature gating
- ![Screenshot Placeholder — Features: Content](assets/screenshots/features-content.png)
  - Context: Preview, create, edit/AI blocks
- ![Screenshot Placeholder — Features: Reports](assets/screenshots/features-reports.png)
  - Context: Limited/Standard/Advanced with export actions
- ![Screenshot Placeholder — Diffie‑Hellman](assets/screenshots/dh-demo.png)
  - Context: Key pair generation and shared secret demo

Note: The above are placeholders; add actual images under assets/screenshots/ and update paths.

### 6.4 Notable Implementation Details
- Consistent Manage Subscription button styling across pages for accessibility
- tokenUpdated custom event + storage + visibility listeners ensure cross‑tab coherence
- Vigenère alphabet includes digits and punctuation to avoid lossy transforms
- Base64 padding removed in token strings; decoder adds padding when necessary

---

## 7. Test Report
- Summary
  - Unit and integration tests executed locally
  - As of latest run, encryption tests passed; API flows validated
- Evidence
  - See test_result.md for summarized outcomes
  - README indicates 16/16 API tests passed for core flows
- Findings
  - Button color inconsistency identified and fixed to improve UX consistency
  - No functional regressions observed after gating and subscription synchronization changes
- Open Items
  - None critical; future work could add SSR‑level checks for advanced scenarios

---

## 8. Conclusion
The project fulfills its educational objectives by implementing a transparent, end‑to‑end JWT‑like token system protected by classical ciphers and governed by a subscription tier model. The architecture deliberately favors pedagogical clarity over production‑grade security, with explicit documentation of trade‑offs. Feature gating, real‑time subscription synchronization, and a modern UI together create a cohesive learning platform. Future iterations can introduce modern cryptography (Web Crypto), SSR enforcement, role‑based access, and more extensive automated tests while retaining the current educational pathway.


---

## 9. References
[1] Jones, R. (2018). Classical Cryptography and Cryptanalysis. Springer.  
[2] RFC 7519: JSON Web Token (JWT). IETF, 2015. https://datatracker.ietf.org/doc/html/rfc7519  
[3] Next.js Documentation. Vercel. https://nextjs.org/docs  
[4] Tailwind CSS Documentation. https://tailwindcss.com/docs  
[5] Shadcn/UI Components. https://ui.shadcn.com  
[6] Diffie, W., & Hellman, M. E. (1976). New Directions in Cryptography. IEEE Transactions on Information Theory, 22(6), 644–654.  

Citation style: Use IEEE as shown above or adapt to APA 7th edition if required by your institution. Inline citations can be inserted as [1], [2], etc., where relevant in the body of this report.

## Appendix A. Supplementary Materials
A.1 Test Environment  
- Node.js: 20.x  
- Next.js: 14.x  
- OS: [Windows/macOS/Linux]  
- Browser: [Chrome/Firefox/Edge]

A.2 Sample Token (Redacted)  
- Provide a sanitized example token demonstrating the header.payload.signature structure for classroom use.

A.3 Additional Figures/Tables  
- Insert any extended diagrams or results that support the main text without interrupting the flow.

A.4 Reproducibility Checklist  
- Commands used to run tests (see README)  
- Steps to seed demo users and generate tokens  
- Any environment variables or config toggles (with safe defaults)
