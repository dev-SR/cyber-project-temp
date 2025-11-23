// Test encryption algorithms
import * as groupSubstitution from './lib/crypto/groupSubstitution.js';
import * as vigenere from './lib/crypto/vigenere.js';
import * as transposition from './lib/crypto/transposition.js';
import * as diffieHellman from './lib/crypto/diffieHellman.js';
import { createToken, verifyToken, decodeToken } from './lib/token.js';

console.log('=== Testing Encryption Algorithms ===\n');

// Test 1: Group Substitution Cipher
console.log('1. Group Substitution Cipher (Header)');
const testText1 = 'HELLO';
const encrypted1 = groupSubstitution.encrypt(testText1);
const decrypted1 = groupSubstitution.decrypt(encrypted1);
console.log(`  Original: ${testText1}`);
console.log(`  Encrypted: ${encrypted1}`);
console.log(`  Decrypted: ${decrypted1}`);
console.log(`  ✓ Test ${testText1 === decrypted1 ? 'PASSED' : 'FAILED'}\n`);

// Test 2: Vigenère Cipher
console.log('2. Vigenère Cipher (Payload)');
const testText2 = 'HELLO WORLD';
const key2 = 'SECRET';
const encrypted2 = vigenere.encrypt(testText2, key2);
const decrypted2 = vigenere.decrypt(encrypted2, key2);
console.log(`  Original: ${testText2}`);
console.log(`  Key: ${key2}`);
console.log(`  Encrypted: ${encrypted2}`);
console.log(`  Decrypted: ${decrypted2}`);
console.log(`  ✓ Test ${testText2 === decrypted2 ? 'PASSED' : 'FAILED'}\n`);

// Test 3: Transposition Cipher
console.log('3. Transposition Cipher (Signature)');
const testText3 = 'HELLO';
const key3 = '34152';
const encrypted3 = transposition.encrypt(testText3, key3);
const decrypted3 = transposition.decrypt(encrypted3, key3);
console.log(`  Original: ${testText3}`);
console.log(`  Key: ${key3}`);
console.log(`  Encrypted: ${encrypted3}`);
console.log(`  Decrypted: ${decrypted3}`);
console.log(`  ✓ Test ${testText3 === decrypted3 ? 'PASSED' : 'FAILED'}\n`);

// Test 4: Diffie-Hellman Key Exchange
console.log('4. Diffie-Hellman Key Exchange');
const alice = diffieHellman.generateKeyPair();
const bob = diffieHellman.generateKeyPair();
const aliceSharedSecret = diffieHellman.computeSharedSecret(alice.privateKey, bob.publicKey);
const bobSharedSecret = diffieHellman.computeSharedSecret(bob.privateKey, alice.publicKey);
console.log(`  Alice Public Key: ${alice.publicKey}`);
console.log(`  Bob Public Key: ${bob.publicKey}`);
console.log(`  Alice Shared Secret: ${aliceSharedSecret}`);
console.log(`  Bob Shared Secret: ${bobSharedSecret}`);
console.log(`  ✓ Test ${aliceSharedSecret === bobSharedSecret ? 'PASSED' : 'FAILED'}\n`);

// Test 5: Token Creation and Verification
console.log('5. JWT-like Token System');
const payload = {
  userId: '123',
  email: 'test@example.com',
  subscription: 'premium'
};
const token = createToken(payload);
console.log(`  Token: ${token.substring(0, 50)}...`);

const verification = verifyToken(token);
console.log(`  Verification: ${verification.valid ? 'VALID' : 'INVALID'}`);
if (verification.valid) {
  console.log(`  Payload Email: ${verification.payload.email}`);
  console.log(`  Payload Subscription: ${verification.payload.subscription}`);
}
console.log(`  ✓ Test ${verification.valid ? 'PASSED' : 'FAILED'}\n`);

// Test 6: Token Decoding
console.log('6. Token Decoding');
const decoded = decodeToken(token);
if (!decoded.error) {
  console.log(`  Header Algorithm: ${decoded.header.alg}`);
  console.log(`  Payload Email: ${decoded.payload.email}`);
  console.log(`  ✓ Test PASSED\n`);
} else {
  console.log(`  Error: ${decoded.error}`);
  console.log(`  ✓ Test FAILED\n`);
}

console.log('=== All Tests Complete ===');
