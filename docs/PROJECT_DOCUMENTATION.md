# JWT-like Token Issuing SaaS - Documentation

## Overview

A Next.js web application demonstrating a JWT-like token system with custom-implemented classical encryption algorithms. This project includes subscription management with both Stripe and demo payment options, plus Diffie-Hellman key exchange implementation.

## 🔐 Custom Encryption Implementation

All encryption algorithms are implemented **from scratch** without external libraries:

### 1. Group Substitution Cipher (Header Encryption)
- **Algorithm**: Each character maps to a predefined character group
- **Example**: `H` → `S+SS`, `E` → `V+VV`, `L` → `O+OO`
- **Usage**: Encrypts the token header
- **Implementation**: `/app/lib/crypto/groupSubstitution.js`

```javascript
// Example
Input:  "HELLO"
Output: "S+SS|V+VV|O+OO|O+OO|L+LL"
```

### 2. Vigenère Cipher (Payload Encryption)
- **Algorithm**: Polyalphabetic substitution using a secret key
- **Key**: "SECRETKEY" (default)
- **Usage**: Encrypts the token payload (user data, subscription info)
- **Implementation**: `/app/lib/crypto/vigenere.js`

```javascript
// Example
Input:  "HELLO WORLD"
Key:    "SECRET"
Output: "ZINcSKoSTcH"
```

### 3. Transposition Cipher (Signature Encryption)
- **Algorithm**: Rearranges characters based on a numeric key
- **Key**: "34152" (default)
- **Usage**: Encrypts the token signature for integrity verification
- **Implementation**: `/app/lib/crypto/transposition.js`

```javascript
// Example
Input:  "HELLO"
Key:    "34152"
Output: "LOHEL"
```

### 4. Diffie-Hellman Key Exchange (Bonus)
- **Algorithm**: Secure key negotiation between two parties
- **Parameters**: Prime P=23, Generator G=5
- **Usage**: Demonstrates secure key exchange over insecure channels
- **Implementation**: `/app/lib/crypto/diffieHellman.js`

## 🎯 Token Structure

Tokens follow a JWT-like structure with three parts separated by dots:

```
header.payload.signature
```

Each part is:
1. Encrypted using its respective cipher
2. Base64 encoded
3. Concatenated with `.` as separator

### Token Creation Process

```
1. Header   → Group Substitution → Base64 → encoded_header
2. Payload  → Vigenère Cipher    → Base64 → encoded_payload
3. Signature → Transposition     → Base64 → encoded_signature
4. Final Token: encoded_header.encoded_payload.encoded_signature
```

### Payload Contents

```json
{
  "userId": "unique_id",
  "email": "user@example.com",
  "name": "User Name",
  "subscription": "free|basic|premium",
  "iat": 1234567890,
  "exp": 1234571490
}
```

Note: iat = Issued-at UNIX timestamp; exp = Expiration UNIX timestamp (default 1 hour after iat).

## 🏗️ Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js    # Backend API routes
│   ├── page.js                      # Home page (token decoder)
│   ├── auth/page.js                 # Login/Register page
│   └── dashboard/page.js            # Dashboard (subscription mgmt)
├── lib/
│   ├── crypto/
│   │   ├── groupSubstitution.js    # Group Substitution Cipher
│   │   ├── vigenere.js             # Vigenère Cipher
│   │   ├── transposition.js        # Transposition Cipher
│   │   └── diffieHellman.js        # DH Key Exchange
│   ├── token.js                     # Token creation/verification
│   └── db.js                        # JSON database operations
└── data/
    └── users.json                   # User database
```

## 🏛️ High-Level Architecture

```mermaid
flowchart TB
  user[User / Browser]
  subgraph Frontend ["Next.js Frontend (Pages & Components)"]
    home["Home (Token Decoder)"]
    dashboard["Dashboard (Subscription & DH)"]
    features["Features: Analytics / Content / Reports"]
    subscription["Subscription Page"]
    protected["ProtectedFeature (gating)"]
    local[(localStorage: token, user)]
  end

  subgraph AppLibs ["Application Libraries"]
    accessControl["lib/accessControl.js\n- FEATURES/DETAILS\n- verifyUserToken()\n- hasFeatureAccess()"]
    token["lib/token.js\n- createToken()\n- verifyToken()\n- decodeToken()"]
    ciphers["lib/crypto/*\n- groupSubstitution (header)\n- vigenere (payload)\n- transposition (signature)\n- diffieHellman (demo)"]
  end

  subgraph API ["Next.js API Routes"]
    auth["/api/register\n/api/login"]
    verify["/api/verify"]
    payment["/api/payment (demo | stripe)"]
    dh["/api/dh/generate\n/api/dh/shared-secret"]
    db[(data/users.json)]
    stripe[(Stripe):::ext]
  end

  classDef ext fill:#222,stroke:#999,color:#ccc

  user --> home
  user --> dashboard
  user --> features
  user --> subscription

  home -->|read/paste| protected
  dashboard --> protected
  features --> protected
  subscription --> protected

  protected -->|verifyUserToken| accessControl
  accessControl --> token
  token --> ciphers

  home -->|reads/writes| local
  dashboard -->|reads/writes| local
  subscription -->|reads/writes| local
  protected -.->|"listen: tokenUpdated,\nstorage, visibilitychange"| protected

  dashboard -->|fetch| auth
  dashboard -->|fetch| payment
  subscription -->|fetch| payment
  home -->|fetch| verify
  features -->|fetch (if needed)| verify

  auth --> db
  verify --> token
  payment --> auth
  payment --> db
  payment --> stripe
  auth -->|returns {user, token}| dashboard
  payment -->|returns updated token| subscription
  verify -->|returns validity & payload| home
```

## 🚀 Features

### 1. Token Decoder (Home Page)
- JWT.io-style interface
- Paste any token to decode and verify
- Shows decrypted header, payload, and signature
- Visual verification status (valid/invalid/expired)
- Displays subscription tier from token

### 2. Authentication System
- User registration with email/password
- Secure login (password hashing)
- Automatic token issuance on auth
- Token stored in localStorage

### 3. Subscription Management
- **Three Tiers**:
  - Free: Basic features, 100 tokens/month
  - Basic: $9.99/month, 1,000 tokens/month
  - Premium: $29.99/month, Unlimited tokens, DH key exchange

### 4. Payment System
Users can choose between:

#### Demo Payment
- Instant activation
- No external API required
- Perfect for testing/demos

#### Stripe Payment (Optional)
- Requires `STRIPE_SECRET_KEY` in `.env`
- Real payment processing simulation
- Graceful fallback to demo if not configured

### 5. Diffie-Hellman Key Exchange
- Generate public/private key pairs
- Compute shared secrets
- Visual demonstration of key exchange
- Educational tool for cryptography

## 📡 API Endpoints

### Authentication

#### POST `/api/register`
Register a new user.

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "1234567890",
    "email": "john@example.com",
    "name": "John Doe",
    "subscription": "free"
  },
  "token": "header.payload.signature"
}
```

#### POST `/api/login`
Authenticate user and get token.

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### Token Management

#### POST `/api/verify`
Verify token validity and extract payload.

```bash
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your.token.here"}'
```

**Response:**
```json
{
  "valid": true,
  "payload": {
    "userId": "1234567890",
    "email": "john@example.com",
    "subscription": "premium"
  }
}
```

### Payment

#### POST `/api/payment`
Process subscription upgrade.

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your.token.here",
    "tier": "premium",
    "paymentMethod": "demo"
  }'
```

**Payment Methods:**
- `demo` - Instant activation
- `stripe` - Stripe payment (requires API key)

### Diffie-Hellman

#### POST `/api/dh/generate`
Generate DH key pair.

```bash
curl -X POST http://localhost:3000/api/dh/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "publicKey": 16,
  "parameters": {
    "P": 23,
    "G": 5
  }
}
```

#### POST `/api/dh/shared-secret`
Compute shared secret.

```bash
curl -X POST http://localhost:3000/api/dh/shared-secret \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": 6,
    "otherPublicKey": 16
  }'
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- Yarn package manager

### Installation

1. **Install Dependencies**
```bash
cd /app
yarn install
```

2. **Environment Variables** (Optional)
Create `.env` file:
```env
# Optional: Add Stripe key for real payment processing
STRIPE_SECRET_KEY=sk_test_xxxxx
```

3. **Start Development Server**
```bash
yarn dev
```

Application runs on `http://localhost:3000`

## 🔒 Authentication, Authorization, and Permissions — Detailed

This section consolidates the practical details of the AAA model used throughout the application, with concrete flows, code references, and operational notes.

### A. Authentication (Who you are)
- Responsibility: API routes (/api/register, /api/login) validate credentials and issue a JWT‑like token.
- Token issuance: lib/token.js → createToken(payload)
  - Header: Group Substitution cipher → Base64 (no padding)
  - Payload: Vigenère cipher → Base64; includes { userId, email, name, subscription, iat, exp }
  - Signature: Transposition cipher over `${encodedHeader}.${encodedPayload}` → Base64
- Storage (client):
  - localStorage keys: 'token' (string) and 'user' (JSON)
  - After login/upgrade, a custom event window.dispatchEvent(new Event('tokenUpdated')) is emitted to notify all tabs/components.
- Logout:
  - Remove 'token' and 'user' from localStorage; navigate to /auth.
- Expiration and renewal:
  - exp = iat + 3600s by default.
  - When expired, verifyToken returns { valid: false, error: 'Token expired' } and the UI should redirect to /auth.
  - Renewal is via re‑login or any flow that returns a new token (e.g., successful upgrade/payment).

Example (server‑side pseudocode):
- const user = db.findByEmail(email)
- if (!user || !checkPassword(user, pw)) return 401
- const token = createToken({ userId: user.id, email, name: user.name, subscription: user.subscription })
- return { token, user: { id: user.id, email, name: user.name, subscription: user.subscription } }

### B. Authorization (What you’re allowed to do)
- Responsibility: Validate the token’s integrity and freshness before using its claims.
- Core function: lib/token.js → verifyToken(token)
  1) Split token into [encodedHeader, encodedPayload, encodedSignature]
  2) Decrypt signature: base64Decode(encodedSignature) → transposition.decrypt → decryptedSig
  3) Recompute expected = `${encodedHeader}.${encodedPayload}`; if mismatch → Invalid signature
  4) Decrypt payload: base64Decode(encodedPayload) → vigenere.decrypt → JSON.parse
  5) Check exp vs current time → expired if past
  6) Return { valid, payload } or { valid: false, error }
- Convenience: decodeToken(token) returns { header, payload, signature } for UI purposes (non‑authoritative without step 2/5).
- Trust boundaries:
  - Signature prevents client‑side tampering with header/payload parts.
  - Time‑based expiry constrains token lifetime.

### C. Permissions (Fine‑grained feature gating)
- Policy source: lib/accessControl.js
  - FEATURES: tier → [featureIds]
  - FEATURE_DETAILS: metadata used for display
  - hasFeatureAccess(tier, featureId): boolean
  - verifyUserToken(token): combines verification + decoding and returns { valid, payload, header, tier }
- UI enforcement: components/ProtectedFeature.jsx
  - On mount:
    - Read token from localStorage; verify via verifyUserToken
    - currentTier = verification.tier (default 'free' if invalid/missing)
    - hasAccess = hasFeatureAccess(currentTier, featureId)
  - Render:
    - If hasAccess → render children
    - Else → render fallback or standard upgrade CTA linking to /subscription
  - Real‑time sync listeners:
    - 'tokenUpdated' custom event (emitted on login/upgrade)
    - 'storage' event for 'token'/'user' keys (cross‑tab)
    - 'visibilitychange' (re‑verify on focus)
- Usage examples:
  - <ProtectedFeature featureId="basic_analytics_view" requiredTier="free"> ... </ProtectedFeature>
  - <ProtectedFeature featureId="content_creation" requiredTier="basic"> ... </ProtectedFeature>
  - <ProtectedFeature featureId="advanced_reports" requiredTier="premium"> ... </ProtectedFeature>
- Tier examples (see FEATURE_DETAILS for full list):
  - free → basic_analytics_view, content_preview, limited_reports
  - basic → + advanced_analytics, content_creation, standard_reports, export_csv
  - premium → + real_time_analytics, content_editing, ai_content_generation, advanced_reports, export_pdf, custom_reports, api_access

### D. Error handling and edge cases
- Missing token: treat as anonymous; render only public/preview features with upgrade/login prompts.
- Expired token: deny access with clear message; prompt re‑authentication.
- Signature mismatch: deny access and suggest re‑login; indicates tampering.
- Clock skew: in production, add leeway; demo uses strict comparison.
- Storage cleared or blocked: UI gracefully falls back to free tier.

### E. Security notes (educational scope)
- Classical ciphers are not production‑grade; they make the pipeline auditable for learners.
- LocalStorage is vulnerable to XSS; in production use HTTP‑only cookies, modern crypto (HMAC/RS256), and server/edge authorization.
- Consider adding claims like iss/aud/sub/nbf for real systems and validate them on each request.

Code references:
- lib/token.js — createToken, verifyToken, decodeToken
- lib/accessControl.js — FEATURES, FEATURE_DETAILS, hasFeatureAccess, verifyUserToken
- components/ProtectedFeature.jsx — runtime gating logic
- app/dashboard/page.js, app/subscription/page.js — token storage, upgrade flows, tokenUpdated dispatch

## 🧪 Testing

### Backend Testing
```bash
# Test all encryption algorithms
node test_encryption.js
```

**Test Results:**
- ✅ Group Substitution Cipher
- ✅ Vigenère Cipher
- ✅ Transposition Cipher
- ✅ Diffie-Hellman Key Exchange
- ✅ Token Creation & Verification

### Manual API Testing
Use the provided curl commands in the API Endpoints section.

## 🎨 UI/UX Features

### Design System
- **Framework**: Tailwind CSS
- **Components**: shadcn/ui
- **Theme**: Dark mode with purple/pink gradients
- **Responsive**: Mobile-first design

### Pages

1. **Home (`/`)**
   - Token decoder interface
   - Real-time decryption
   - Signature verification
   - Expiration checking

2. **Authentication (`/auth`)**
   - Tabbed login/register
   - Form validation
   - Error handling
   - Auto-redirect on success

3. **Dashboard (`/dashboard`)**
   - User profile display
   - Current token view
   - Subscription tier selection
   - Payment method choice
   - DH key exchange demo

## 🔒 Security Considerations

### Current Implementation (Educational)
- Simple password hashing (Base64)
- JSON file-based storage
- Client-side token storage (localStorage)

### Production Recommendations
- Use bcrypt/scrypt for password hashing
- Implement proper database (PostgreSQL/MongoDB)
- Use httpOnly cookies for tokens
- Add rate limiting
- Implement CSRF protection
- Add input sanitization

## 📚 Cryptography Details

### Algorithm Analysis

| Algorithm | Type | Strength | Use Case |
|-----------|------|----------|----------|
| Group Substitution | Classical | Low | Educational/Demo |
| Vigenère | Polyalphabetic | Low-Medium | Educational/Demo |
| Transposition | Classical | Low | Educational/Demo |
| Diffie-Hellman | Modern | High (with proper params) | Key Exchange |

**Note**: The classical ciphers (Group Substitution, Vigenère, Transposition) are implemented for educational purposes. For production systems, use modern cryptography (AES, RSA, etc.).

### Why These Algorithms?

1. **Educational Value**: Demonstrates encryption concepts
2. **From-Scratch Implementation**: No external crypto libraries
3. **Historical Significance**: Classic cryptography methods
4. **Visual Understanding**: Easy to trace encryption/decryption

## 🎓 Learning Objectives

This project demonstrates:
- Classical cryptography algorithms
- Token-based authentication
- JWT-like structure and validation
- Subscription/payment models
- Key exchange protocols
- Full-stack Next.js development
- API design and implementation

## 📝 Usage Examples

### Creating and Verifying Tokens

```javascript
import {createToken, verifyToken} from './token';

// Create token
const payload = {
    userId: '123',
    email: 'user@example.com',
    subscription: 'premium'
};
const token = createToken(payload);

// Verify token
const result = verifyToken(token);
console.log(result.valid); // true
console.log(result.payload); // Decrypted payload
```

### Using Encryption Algorithms

```javascript
import * as vigenere from './lib/crypto/vigenere';

const plaintext = "SECRET MESSAGE";
const key = "MYKEY";

const encrypted = vigenere.encrypt(plaintext, key);
const decrypted = vigenere.decrypt(encrypted, key);

console.log(encrypted); // Encrypted string
console.log(decrypted); // "SECRET MESSAGE"
```

## 🤝 Contributing

This is an educational project. Feel free to:
- Add more cipher implementations
- Improve the UI/UX
- Add unit tests
- Enhance security features

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Classical cryptography algorithms based on historical implementations
- Modern web development practices using Next.js 14
- UI components from shadcn/ui
- Design inspiration from jwt.io

---

**Built with ❤️ using Next.js, Tailwind CSS, and custom cryptography**



## Programming Task 2 — Implementation Mapping (Academic Overview)

Date: 2025-11-29  
Version: 1.0

This project satisfies the Programming Task 2 requirement to implement at least three classical cryptographic methods with both Encrypt and Decrypt functions, integrated into a full token lifecycle and access‑controlled SaaS demonstration. A detailed academic write‑up is available in ACADEMIC_DOCUMENTATION.md under “0. Programming Task 2 Implementation — Consolidated Overview.” Below is a concise mapping to the codebase for quick reference.

- Implemented Methods (Encrypt & Decrypt):
  - Group Substitution Cipher — Header protection  
    File: lib/crypto/groupSubstitution.js; used by lib/token.js createToken/decodeToken
  - Vigenère Cipher — Payload protection  
    File: lib/crypto/vigenere.js; used by lib/token.js createToken/verifyToken/decodeToken
  - Transposition Cipher (Columnar) — Signature/integrity  
    File: lib/crypto/transposition.js; used by lib/token.js createToken/verifyToken
  - Bonus: Diffie–Hellman Key Exchange — parameter generation and shared secret  
    File: lib/crypto/diffieHellman.js; surfaced in Dashboard (Diffie–Hellman tab)

- Token Lifecycle
  1) Creation: Header (Group Substitution) → Base64; Payload (Vigenère) → Base64; Signature = Transposition(Base64(header)+'.'+Base64(payload)) → Base64  
     Source: lib/token.js → createToken
  2) Verification: Decrypt signature (Transposition) and compare; decrypt payload (Vigenère); check exp  
     Source: lib/token.js → verifyToken
  3) Decoding for UI: Decrypt header (Group Substitution) and payload (Vigenère) for visualization  
     Source: lib/token.js → decodeToken; app/page.js demo

- Authentication, Authorization, Permissions (AAA)
  - Authentication: /api/register and /api/login issue tokens; client persists 'token' and 'user' in LocalStorage
  - Authorization: verifyToken enforces integrity (Transposition) and freshness (exp)
  - Permissions: lib/accessControl.js defines tier→features policy; components/ProtectedFeature.jsx performs runtime gating and listens for 'tokenUpdated', 'storage', and 'visibilitychange' for real‑time synchronization

- Feature Pages and Gating
  - /features/analytics — Free/Basic/Premium sections gated via feature IDs
  - /features/content — Preview (Free), Create (Basic), Edit & AI (Premium)
  - /features/reports — Limited (Free), Standard + CSV (Basic), Advanced + PDF/Custom (Premium)

- Testing & Validation
  - Unit: test_encryption.js (cipher round‑trips and DH equality)
  - Integration: backend_test.py (auth, payment/upgrade, verification)
  - Results summary: test_result.md and README (16/16 API tests passed)

For expanded narrative, architecture diagrams, FURPS+, and a step‑by‑step description of the algorithms and flows, see ACADEMIC_DOCUMENTATION.md (Section 0) and PROGRAMMING_TASK_2_REPORT.md (Sections 1–9).