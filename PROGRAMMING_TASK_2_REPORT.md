# Programming Task 2 — Concise Implementation Report (≤ 10 pages)

Date: 2025‑11‑29  
Version: 1.0  
Repository: JWT‑like Token Issuing SaaS (Next.js)

---

## 0. Assignment Mapping

Requirement (homework practice topics.pdf): Implement at least 3 basic/easy cryptographic methods with both Encrypt & Decrypt functions; provide documentation (≤ 10 pages). Bonus for Diffie–Hellman.

Chosen methods (Encrypt & Decrypt implemented from scratch):
- Group Substitution Cipher — header protection
  - File: lib/crypto/groupSubstitution.js
- Vigenère Cipher — payload protection
  - File: lib/crypto/vigenere.js
- Transposition (Columnar) Cipher — signature/integrity
  - File: lib/crypto/transposition.js

Bonus (for higher grade):
- Diffie–Hellman Key Exchange — parameter negotiation and shared secret demo
  - File: lib/crypto/diffieHellman.js

This report also explains: token encryption/decryption, authentication, authorization, and permission enforcement.

---

## 1. System Context and Token Flow

Token format (JWT‑like):
header.payload.signature  (each Base64‑encoded string)

Creation (lib/token.js → createToken):
1) headerStr = JSON.stringify({ alg: 'CUSTOM', typ: 'JWT' })
   - Encrypt with Group Substitution → encryptedHeader → Base64 → encodedHeader
2) payloadStr = JSON.stringify({ ...user, iat, exp })
   - Encrypt with Vigenère (key = 'SECRETKEY') → encryptedPayload → Base64 → encodedPayload
3) signatureData = encodedHeader + '.' + encodedPayload
   - Encrypt with Transposition (key = '34152') → encryptedSignature → Base64 → encodedSignature
4) token = `${encodedHeader}.${encodedPayload}.${encodedSignature}` (Base64 padding stripped during create; decoder re‑adds as needed)

Verification (lib/token.js → verifyToken):
- Decrypt signature with Transposition, compare to `${encodedHeader}.${encodedPayload}` (detects tampering)
- Decrypt payload with Vigenère, parse JSON, check exp ≥ now
- Returns { valid, payload } or { valid: false, error }

Decoding (lib/token.js → decodeToken):
- Decrypt header with Group Substitution; decrypt payload with Vigenère; return { header, payload, signature }

---

## 2. Method 1 — Group Substitution Cipher (Header)

Purpose: Deterministic character‑to‑group mapping for obfuscating header JSON.

Alphabet/Mapping: Fixed, invertible map such as "H → S+SS", separators between groups are '|'. Unknown characters fall back to literal.

2.1 Encrypt(plaintext)
- For each character c in plaintext, output MAP[c] if present, else c+'+..' form; join groups with '|'.

Pseudocode:
function encryptGroupSubstitution(plaintext):
  out = []
  for c in plaintext:
    if c in MAP: out.push(MAP[c])
    else: out.push(c + "+" + c + c)   // example fallback
  return out.join('|')

2.2 Decrypt(ciphertext)
- Split by '|', convert each group g with REVERSE_MAP[g] if present; otherwise take the first char before '+' as literal.

Pseudocode:
function decryptGroupSubstitution(ciphertext):
  out = []
  for g in ciphertext.split('|'):
    if g in REVERSE: out.push(REVERSE[g])
    else: out.push(g.split('+')[0])
  return ''.join(out)

Complexity: O(n). Deterministic and perfectly invertible given the map.

Where used: lib/token.js createToken/decodeToken; app/page.js decoder.

---

## 3. Method 2 — Vigenère Cipher (Payload)

Purpose: Polyalphabetic substitution across an extended alphabet to protect the payload JSON.

Alphabet (exactly as implemented):
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?-_"

Key: Default 'SECRETKEY'.

3.1 Encrypt(plaintext, key)
- For each plaintext character p in ALPHABET, shift forward by index(key[k]) modulo |ALPHABET|; non‑alphabet characters are copied as‑is.

Pseudocode:
function vigenereEncrypt(plaintext, key):
  out = []
  ki = 0
  for p in plaintext:
    idx = ALPHABET.indexOf(p)
    if idx == -1: out.push(p); continue
    k = key[ki % len(key)]; kidx = ALPHABET.indexOf(k.upper())
    out.append(ALPHABET[(idx + kidx) % |A|])
    ki += 1
  return ''.join(out)

3.2 Decrypt(ciphertext, key)
- Reverse: subtract kidx instead of adding; wrap modulo |ALPHABET|.

Pseudocode:
function vigenereDecrypt(ciphertext, key):
  out = []
  ki = 0
  for c in ciphertext:
    idx = ALPHABET.indexOf(c)
    if idx == -1: out.push(c); continue
    k = key[ki % len(key)]; kidx = ALPHABET.indexOf(k.upper())
    newIdx = (idx - kidx) mod |A|
    out.append(ALPHABET[newIdx])
    ki += 1
  return ''.join(out)

Complexity: O(n). Exact reversibility assuming same alphabet and key.

Where used: lib/token.js createToken/verifyToken/decodeToken; app/page.js decoder implementation mirrors library.

---

## 4. Method 3 — Transposition Cipher (Signature)

Purpose: Columnar transposition provides simple permutation‑based integrity binding over Base64(header) and Base64(payload).

Key: '34152' (digits define column read order).

4.1 Encrypt(plaintext, key)
- Interpret key digits as columns, compute rows = ceil(n / cols), fill a grid row‑wise with plaintext (pad if needed), then read columns in key order (ascending key value), concatenating characters.

Pseudocode:
function transpositionEncrypt(text, keyDigits):
  cols = len(keyDigits); rows = ceil(len(text)/cols)
  grid = matrix(rows, cols, fill='X')
  i = 0
  for r in 0..rows-1:
    for c in 0..cols-1:
      if i < len(text): grid[r][c] = text[i]; i += 1
  // read by increasing key digit value
  order = sortByValueWithIndex(keyDigits) // [{val, idx}, ...]
  out = []
  for {idx} in order:
    for r in 0..rows-1: out.push(grid[r][idx])
  return ''.join(out)

4.2 Decrypt(ciphertext, key)
- Inverse: compute grid shape, fill column‑wise according to sorted key order, then read row‑wise; strip padding.

Pseudocode:
function transpositionDecrypt(ciphertext, keyDigits):
  cols = len(keyDigits); rows = ceil(len(ciphertext)/cols)
  grid = matrix(rows, cols, fill='')
  order = sortByValueWithIndex(keyDigits)
  i = 0
  for {idx} in order:
    for r in 0..rows-1:
      if i < len(ciphertext): grid[r][idx] = ciphertext[i]; i += 1
  // read rows
  out = []
  for r in 0..rows-1:
    for c in 0..cols-1: out.push(grid[r][c])
  return rstrip('X')

Complexity: O(n). Fully invertible with consistent padding rules.

Where used: lib/token.js createToken/verifyToken; app/page.js verification demo via transpositionDecrypt.

---

## 5. Bonus — Diffie–Hellman Key Exchange

Educational demonstration of secure key agreement (not used to secure the token in this prototype, but provided for bonus credit and learning):
- Parameters: small demo prime P=23, generator G=5 (or configurable)
- Steps: Party A picks a, sends A=G^a mod P; Party B picks b, sends B=G^b mod P; shared secret S = B^a ≡ A^b (mod P)
- Files: lib/crypto/diffieHellman.js; UI: /dashboard, Diffie‑Hellman tab

---

## 6. Authentication, Authorization, and Permissions

This section describes, in implementation terms, how users authenticate to obtain a token, how the app authorizes every request to protected UI capabilities using that token, and how fine‑grained permissions (feature gating) are enforced consistently across pages and tabs.

6.1 Authentication (Login & Token Issuance)
- Actors and artifacts:
  - User provides credentials to /api/login (demo credentials backed by data/users.json)
  - Server generates a JWT‑like token with createToken(payload) from lib/token.js
  - Browser persists both token and user in LocalStorage under keys 'token' and 'user'
- Payload fields on issuance:
  - { userId, email, name, subscription, iat, exp }
  - exp defaults to iat + 3600 seconds (1 hour)
- Sequence (narrative):
  1) Client POSTs email/password to /api/login
  2) API validates credentials (demo) and determines the user’s subscription tier
  3) API calls createToken({ userId, email, name, subscription })
  4) Response returns { token, user }
  5) Client stores token and user to LocalStorage and dispatches window.dispatchEvent(new Event('tokenUpdated'))
- Pseudocode (server side):
  - const user = db.findByEmail(email)
  - if (!user || !checkPassword(user, pw)) return 401
  - const token = createToken({ userId: user.id, email, name: user.name, subscription: user.subscription })
  - return { token, user: { id: user.id, email, name: user.name, subscription: user.subscription } }
- Logout:
  - Remove LocalStorage keys 'token' and 'user' and navigate to /auth
  - No server revoke list is maintained in this educational prototype
- Renewal strategy (demo):
  - Re‑login or trigger any action that issues a fresh token (e.g., successful upgrade)

6.2 Authorization (Integrity + Validity Verification)
Authorization is the act of verifying the token and deciding what a user can do. Verification must precede any permission check.
- verifyToken(token) in lib/token.js:
  1) Split token into [encodedHeader, encodedPayload, encodedSignature]
  2) Base64‑decode encodedSignature and transposition.decrypt with key → decryptedSig
  3) Recompute expected = encodedHeader + '.' + encodedPayload; if decryptedSig !== expected → Invalid signature
  4) Base64‑decode encodedPayload and vigenere.decrypt with key → payload JSON
  5) Parse payload; if payload.exp < now → Token expired
  6) Return { valid: true, payload } or { valid: false, error }
- decodeToken(token): convenience for UI that returns { header, payload, signature } without enforcing signature validity on its own (used for the Home decoder page).
- Trust boundaries:
  - Signature check (Transposition) detects client‑side tampering of header/payload parts
  - Expiry check limits token lifetime; clock is taken from the browser in this demo

6.3 Permissions Model (Feature Gating)
- Policy source of truth: lib/accessControl.js
  - FEATURES: maps tier → list of feature IDs
  - FEATURE_DETAILS: metadata (name, description, icon) for rendering
  - hasFeatureAccess(tier, featureId): boolean policy check
  - verifyUserToken(token): combines verifyToken + decodeToken and returns { valid, payload, header, tier }
- UI enforcement component: components/ProtectedFeature.jsx
  - Lifecycle:
    1) On mount, read LocalStorage 'token'; call verifyUserToken(token)
    2) Derive currentTier = verification.tier; compute hasAccess = hasFeatureAccess(currentTier, featureId)
    3) Render children if hasAccess; otherwise render fallback or standard upgrade CTA (link to /subscription)
    4) Subscribe to events for real‑time updates:
       - 'tokenUpdated' custom event (emitted after upgrades or login)
       - 'storage' event (cross‑tab updates) for keys 'token'/'user'
       - 'visibilitychange' to re‑validate when the tab gains focus
- Pages using gating:
  - /dashboard and /features/* wrap capabilities with <ProtectedFeature featureId=... requiredTier=...>
- Example policy decisions:
  - free → basic_analytics_view, content_preview, limited_reports
  - basic → + advanced_analytics, content_creation, standard_reports, export_csv
  - premium → + real_time_analytics, content_editing, ai_content_generation, advanced_reports, export_pdf, custom_reports, api_access

6.4 Error Handling and Edge Cases
- Expired token: verifyToken returns { valid: false, error: 'Token expired' }; UI should redirect to /auth or show an error
- Signature mismatch: indicates tampering; deny access and prompt re‑authentication
- Missing token: treat as anonymous (tier = 'free') and render only public/preview features
- Clock skew: small skew can affect exp; for production you would accept a leeway window; demo keeps it strict
- Storage loss (private window or cleared storage): components fallback to free tier and display upgrade/login prompts

6.5 Security Considerations (Educational Scope)
- Classical ciphers (Group Substitution, Vigenère, Transposition) are not cryptographically secure; they are used to make the transformation chain auditable for learners
- LocalStorage is vulnerable to XSS in real apps; for production use HTTP‑only cookies + server‑side checks and modern crypto (HMAC/RS256)
- No audience/issuer claims are enforced; in production include aud/iss/sub/nbf and validate them

6.6 Developer Checklist (How to gate a new feature)
- Define a new feature ID in FEATURE_DETAILS with name/description/icon
- Add the feature ID to the appropriate tier(s) in FEATURES
- Wrap the UI block with:
  <ProtectedFeature featureId="my_feature_id" requiredTier="basic"> ... </ProtectedFeature>
- Optionally provide a fallback prop with a read‑only preview or upgrade hint
- Emit window.dispatchEvent(new Event('tokenUpdated')) after any flow that changes the token or subscription

Code references:
- lib/token.js → createToken, verifyToken, decodeToken
- lib/accessControl.js → FEATURES, FEATURE_DETAILS, hasFeatureAccess, verifyUserToken
- components/ProtectedFeature.jsx → runtime policy enforcement
- app/dashboard/page.js and app/subscription/page.js → token storage, upgrade flows

---

## 7. Testing (Condensed)

Artifacts:
- Unit: test_encryption.js — checks cipher correctness (encrypt/decrypt pairs)
- Integration: backend_test.py — login, payment (upgrade), verification
- Result summary: test_result.md; README notes 16/16 API tests passed

Key Cases:
- Group Substitution: round‑trip on header JSON
- Vigenère: round‑trip payload with extended alphabet
- Transposition: signature decrypt equals `${encodedHeader}.${encodedPayload}`
- Tampering: modify payload part → verifyToken invalid signature
- Expiry: set exp in past → verifyToken expired

---

## 8. How to Reproduce (Quick)

1) yarn install; yarn dev → http://localhost:3000
2) Register/Login → token is issued and saved
3) Dashboard shows current tier and token; Features reflect tier
4) Upgrade via Subscription/Dashboard → token updated; UI reacts immediately
5) Home page: paste token to see decryption and verification messages

---

## 9. Compliance Checklist

- [x] At least 3 methods implemented from the list (Group Substitution, Vigenère, Transposition)
- [x] Encrypt & Decrypt implemented for all 3 (see lib/crypto/*.js)
- [x] Documentation provided within concise format (≤ ~10 pages when rendered)
- [x] Bonus: Diffie–Hellman key exchange included
- [x] Implementation details cover encryption/decryption of token, authentication, authorization, permissions

References to Code:
- lib/token.js — createToken, verifyToken, decodeToken
- lib/crypto/groupSubstitution.js — encrypt/decrypt
- lib/crypto/vigenere.js — encrypt/decrypt
- lib/crypto/transposition.js — encrypt/decrypt
- lib/crypto/diffieHellman.js — key pair & shared secret
- lib/accessControl.js — FEATURES, hasFeatureAccess, verifyUserToken
- components/ProtectedFeature.jsx — runtime gating

---

Notes: Classical ciphers are for educational use only; do not deploy for production security. For real systems, use modern cryptography (Web Crypto / Node crypto) and server‑side verification.