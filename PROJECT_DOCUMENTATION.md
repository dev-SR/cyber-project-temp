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
  "iat": 1234567890,  // Issued at timestamp
  "exp": 1234571490   // Expiration timestamp (1 hour)
}
```

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
import { createToken, verifyToken } from './lib/token';

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
