# JWT-like Token Issuing SaaS 🔐

A Next.js demonstration of JWT-like token system with **custom-implemented classical encryption algorithms** (no external crypto libraries).

## ✨ Features

- 🔒 **Custom Encryption**: Group Substitution, Vigenère, and Transposition ciphers implemented from scratch
- 🎫 **JWT-like Tokens**: header.payload.signature structure with base64 encoding
- 👤 **User Authentication**: Registration, login, and token-based auth
- 💳 **Subscription System**: Free, Basic, Premium tiers with demo and Stripe payment options
- 🔑 **Diffie-Hellman**: Key exchange protocol demonstration
- 🎨 **Modern UI**: Dark theme with Tailwind CSS and shadcn/ui components
- 🧪 **Token Decoder**: JWT.io-style interface for decoding and verifying tokens

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit http://localhost:3000

## 📖 Documentation

- **[USER_GUIDE.md](./USER_GUIDE.md)** - How to use the application
- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Technical details, API docs, architecture
- **[ACADEMIC_DOCUMENTATION.md](./ACADEMIC_DOCUMENTATION.md)** - Academic project report (FURPS+, design, test plan/report) with a consolidated “Programming Task 2 Implementation” section
- **[PROGRAMMING_TASK_2_REPORT.md](./PROGRAMMING_TASK_2_REPORT.md)** - Concise implementation details (≤10 pages) covering 3 ciphers (Encrypt & Decrypt) + Diffie–Hellman bonus

## 🎯 Key Components

### Encryption Algorithms (lib/crypto/)
1. **Group Substitution Cipher** - Character → group mapping (e.g., H → S+SS)
2. **Vigenère Cipher** - Polyalphabetic substitution with secret key
3. **Transposition Cipher** - Character rearrangement based on numeric key
4. **Diffie-Hellman** - Secure key exchange protocol

### Application Pages
- **Home (/)** - Token decoder and verifier
- **/auth** - Login and registration
- **/dashboard** - Subscription management and DH key exchange

### API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/verify` - Token verification
- `POST /api/payment` - Subscription payment
- `POST /api/dh/generate` - Generate DH key pair
- `POST /api/dh/shared-secret` - Compute shared secret

## 🧪 Testing

All backend APIs tested with 100% success rate:
- ✅ 16/16 tests passed
- ✅ Authentication flow
- ✅ Token creation and verification
- ✅ Payment processing
- ✅ Diffie-Hellman key exchange

```bash
# Run encryption tests
node test_encryption.js
```

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

## 💡 Educational Value

This project demonstrates:
- Classical cryptography algorithms
- Token-based authentication systems
- Subscription and payment models
- Full-stack Next.js development
- Secure key exchange protocols

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

For detailed documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
