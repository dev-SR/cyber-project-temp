// Diffie-Hellman Key Exchange Implementation
// For secure key negotiation

// Modular exponentiation: (base^exp) % mod
function modPow(base, exp, mod) {
  let result = 1;
  base = base % mod;
  
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  
  return result;
}

// Public parameters (shared by both parties)
const P = 23; // Prime number
const G = 5;  // Primitive root modulo P

export function generateKeyPair() {
  // Generate private key (random number)
  const privateKey = Math.floor(Math.random() * (P - 2)) + 2;
  
  // Calculate public key: G^privateKey mod P
  const publicKey = modPow(G, privateKey, P);
  
  return { privateKey, publicKey };
}

export function computeSharedSecret(privateKey, otherPublicKey) {
  // Calculate shared secret: otherPublicKey^privateKey mod P
  return modPow(otherPublicKey, privateKey, P);
}

export function getPublicParameters() {
  return { P, G };
}
