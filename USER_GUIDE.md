# 🚀 Quick Start Guide - JWT-like Token SaaS

## Welcome!

This application demonstrates a JWT-like token system with custom encryption algorithms implemented from scratch.

## 🎯 What Can You Do?

### 1. Decode Tokens (Home Page)
Visit the home page to decode and verify tokens:

1. **Paste a Token**: Copy any token from your dashboard
2. **Click Decode**: See the decrypted header, payload, and signature
3. **View Details**: Check expiration, subscription tier, and verification status

### 2. Create an Account
1. Go to **Login/Register** page
2. Click **Register** tab
3. Fill in:
   - Name
   - Email
   - Password
4. Click **Register**
5. You'll be automatically logged in with a token!

### 3. Login
1. Go to **Login/Register** page
2. Enter your email and password
3. Click **Login**
4. You'll receive a new encrypted token

### 4. Manage Subscription
Visit the **Dashboard** to:

#### View Current Plan
- See your current subscription tier
- View your active token
- Check account details

#### Upgrade Subscription
Choose from three tiers:

**Free** (Default)
- Basic token generation
- Standard encryption
- 100 tokens/month
- **Price**: $0

**Basic**
- Advanced token generation
- Enhanced encryption
- 1,000 tokens/month
- Email support
- **Price**: $9.99/month

**Premium**
- Unlimited tokens
- Enterprise encryption
- Priority support
- Custom integrations
- Diffie-Hellman key exchange
- **Price**: $29.99/month

#### Payment Options
1. **Demo Payment** (Recommended for testing)
   - Instant activation
   - No credit card needed
   - Perfect for trying out features

2. **Stripe Payment**
   - Real payment processing
   - Requires Stripe configuration
   - Falls back to demo if not set up

### 5. Try Diffie-Hellman Key Exchange (Premium Feature)
1. Go to **Dashboard** → **Diffie-Hellman** tab
2. Click **Generate Key Pair**
3. See your public key and parameters
4. Share your public key with others
5. Compute shared secrets securely!

## Permissions & Feature Access

- Your current plan determines which features are unlocked on the Dashboard and on /features/* pages.
- Locked features show a clear message and an Upgrade button linking to /subscription.
- Changes propagate instantly across pages and browser tabs:
  - After login or successful upgrade, the app broadcasts a tokenUpdated event.
  - Components listen to storage and visibilitychange to re-verify your tier in real time.
- Quick mapping:
  - Free → Basic Analytics, Content Preview, Limited Reports (7 days)
  - Basic → + Advanced Analytics, Content Creation, Standard Reports (30 days), CSV Export
  - Premium → + Real-time Analytics, Content Editing, AI Generation, Advanced Reports, PDF Export, Custom Builder, API Access

Tip: To gate a new feature, we wrap the UI block in a ProtectedFeature component bound to a featureId and requiredTier.

## 🔐 Understanding Your Token

Your token has three parts (like JWT):

```
header.payload.signature
```

### Header
- Encrypted with **Group Substitution Cipher**
- Contains token metadata
- Example: `{"alg":"CUSTOM","typ":"JWT"}`

### Payload
- Encrypted with **Vigenère Cipher**
- Contains your data:
  - User ID
  - Email
  - Name
  - Subscription tier
  - Expiration time

### Signature
- Encrypted with **Transposition Cipher**
- Ensures token hasn't been tampered with
- Validates token integrity

## 💡 Use Cases

### For Learning
- Understand classical cryptography
- See how tokens work
- Learn about encryption/decryption
- Study key exchange protocols

### For Development
- Test token-based authentication
- Experiment with subscription models
- Understand API integration
- Practice full-stack development

### For Demos
- Show encryption concepts visually
- Demonstrate secure authentication
- Present cryptography algorithms
- Explain token validation

## 🎓 Educational Features

### 1. Visual Token Decoding
See exactly how tokens are:
- Split into parts
- Decrypted using different ciphers
- Verified for integrity
- Checked for expiration

### 2. Real-Time Encryption
Watch as your data is:
- Encrypted character by character
- Transformed using classical ciphers
- Base64 encoded
- Combined into a token

### 3. Key Exchange Demo
Learn Diffie-Hellman by:
- Generating your own keys
- Seeing public parameters
- Computing shared secrets
- Understanding secure communication

## 🛠️ Tips & Tricks

### Getting Started Fast
1. Register a new account
2. Copy your token from dashboard
3. Paste it on home page to decode
4. Try upgrading to Premium (demo payment)
5. Explore Diffie-Hellman key exchange

### Testing Different Features
- Create multiple accounts to test
- Try invalid tokens to see error handling
- Compare tokens from different subscription tiers
- Generate multiple DH key pairs

### Understanding Encryption
1. Look at the encrypted token (long string)
2. Decode it on home page
3. Compare encrypted vs decrypted parts
4. Notice how each cipher transforms data differently

## 🔍 Troubleshooting

### Token Won't Decode
- Check if token is complete (has 3 parts)
- Ensure no extra spaces or characters
- Verify token hasn't expired
- Try logging in again for fresh token

### Login Issues
- Verify email and password are correct
- Check if account exists (try register)
- Ensure all fields are filled

### Payment Not Working
- Use **Demo Payment** for instant activation
- Stripe requires API key configuration
- Check error messages for details

## 🎨 Interface Guide

### Color Coding
- **Purple** = Headers and primary actions
- **Pink** = Secondary actions and accents
- **Green** = Success messages and valid states
- **Red** = Errors and invalid states
- **Blue** = Info and subscription badges

### Navigation
- **Home** = Token decoder
- **Login/Register** = Authentication
- **Dashboard** = Subscription management

## 📱 Mobile Friendly

All features work on mobile devices:
- Responsive design
- Touch-friendly buttons
- Readable on small screens
- No horizontal scrolling

## ⚡ Quick Actions

### Copy Your Token
Dashboard → "Copy Token" button

### Decode Token
Home → Paste → "Decode Token"

### Upgrade Plan
Dashboard → Select tier → Choose payment → "Upgrade"

### Generate DH Keys
Dashboard → Diffie-Hellman tab → "Generate Key Pair"

## 🎉 Have Fun!

This project is built for learning and experimentation. Feel free to:
- Try different features
- Test edge cases
- Explore the encryption
- Learn about cryptography

## 📚 Learn More

Check out `PROJECT_DOCUMENTATION.md` for:
- Technical details
- API documentation
- Encryption algorithms explained
- Architecture overview
- Security considerations

---

**Enjoy exploring cryptography and token-based authentication!** 🔐✨
