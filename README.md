# JWT-like Token Issuing SaaS 🔐

A Next.js demonstration of JWT-like token system with **custom-implemented classical encryption algorithms** (no external crypto libraries).

## ✨ Features

- 🔒 Custom Encryption: Group Substitution, Vigenère, and Transposition ciphers implemented from scratch (no external crypto libs)
- 🎫 JWT-like Tokens: header.payload.signature structure with base64 encoding
- 👤 User Authentication: Registration, login, and token-based auth
- 💳 Subscription System: Free, Basic, Premium tiers with demo and Stripe payment options
- 🧩 Tier-based Feature Gating: Unlocks capabilities per plan using the ProtectedFeature component and lib/accessControl.js policy mapping
- 📄 Feature Pages: /features/analytics, /features/content, /features/reports — each page applies tier-based functionality
- 🔁 Real-time Subscription Sync: Instant UI updates across tabs via tokenUpdated event, storage, and visibilitychange listeners
- 🧪 Enhanced Token Decoder: Home page decodes header/payload/signature, highlights subscription tier, and lists Unlocked/Locked features
- 🔑 Diffie–Hellman: Key exchange protocol demonstration
- 🎨 Modern UI: Dark theme with Tailwind CSS and shadcn/ui components

## 🚀 Quick Start

```bash
# Install dependencies
npm install
yarn install
pnpm install

# Start development server
npm dev
yarn dev
pnpm dev
```

Visit http://localhost:3000

## 🎯 Key Components

### Encryption Algorithms (lib/crypto/)
1. **Group Substitution Cipher** - Character → group mapping (e.g., H → S+SS)
2. **Vigenère Cipher** - Polyalphabetic substitution with secret key
3. **Transposition Cipher** - Character rearrangement based on numeric key
4. **Diffie-Hellman** - Secure key exchange protocol

### Application Pages
- **Home (/)** — Token decoder and verifier; highlights subscription tier and shows an Available Features list with Unlocked/Locked indicators; quick links to feature pages
- **/auth** — Login and registration
- **/dashboard** — Account info, token display, tier‑gated feature previews with Open buttons; Manage Subscription CTA; Diffie–Hellman tab
- **/subscription** — Choose plan, run demo payment, and unlock features dynamically after upgrade
- **/features/analytics** — Interactive charts with tier‑based functionality (Free: preview, Basic: advanced, Premium: real‑time)
- **/features/content** — Content preview/create/edit with AI generation depending on tier
- **/features/reports** — Limited/Standard/Advanced reports with CSV/PDF export and a custom builder by tier

### Access Control and Real-time Sync
- Policy: Tier → features mapping defined in lib/accessControl.js (FEATURES + FEATURE_DETAILS)
- Enforcement: ProtectedFeature component verifies token, checks access, and conditionally renders or shows upgrade prompts
- Token Verification: Transposition signature check, then Vigenère payload decryption; expiration enforced
- Live Updates: App reacts instantly to subscription changes via window tokenUpdated event, storage, and visibilitychange listeners

### API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/verify` - Token verification
- `POST /api/payment` - Subscription payment
- `POST /api/dh/generate` - Generate DH key pair
- `POST /api/dh/shared-secret` - Compute shared secret

## 🔐 Token Structure

```
header.payload.signature
```

Each part is:
1. Encrypted using its respective cipher
2. Base64 encoded
3. Concatenated with dots

**Example Token:**
```
WytbW3wnKycnJ3x6K3p6fG8rb2...  (header)
.
eyIsd2c4TXciRiI1TUY3LkEuQy...  (payload)
.
dG5KMzg4ZHl3akpGaEdLRWRNS...  (signature)
```

## 📚 Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: JavaScript (Node.js 20+)
- **Database**: JSON file-based storage
- **Deployment**: Next.js production build

## ⚠️ Security Note

The classical ciphers (Group Substitution, Vigenère, Transposition) are implemented for **educational purposes only**. For production systems, use modern cryptographic libraries (crypto, bcrypt, etc.).

## 🎓 Use Cases

- Learning cryptography fundamentals
- Understanding token-based authentication
- Teaching encryption/decryption concepts
- Demonstrating subscription models
- Exploring key exchange protocols

## 📸 Screenshots

### Home - Token Decoder
Paste any token to decode and verify with real-time decryption visualization.

### Dashboard - Subscription Management
Choose subscription tiers, process payments, and manage your account.

### Diffie-Hellman Key Exchange
Generate keys and compute shared secrets interactively.

## 🤝 Contributing

This is an educational project. Contributions welcome:
- Add more cipher implementations
- Improve UI/UX
- Add unit tests
- Enhance documentation

## 📄 License

Educational project for learning purposes.

## 🙏 Credits

Built with ❤️ using:
- Next.js for full-stack framework
- Tailwind CSS for styling
- shadcn/ui for components
- Classical cryptography algorithms

---

**Start exploring cryptography today!** 🚀

## 📖 Documentation

- Project Documentation (with High‑Level Architecture Mermaid diagram): [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)
- Academic Project Report: [docs/ACADEMIC_DOCUMENTATION.md](docs/ACADEMIC_DOCUMENTATION.md)
- Programming Task 2 Report: [docs/PROGRAMMING_TASK_2_REPORT.md](docs/PROGRAMMING_TASK_2_REPORT.md)
- User Guide: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- Test Results and scripts: [docs/test_result.md](docs/test_result.md), [docs/test_encryption.js](docs/test_encryption.js)
