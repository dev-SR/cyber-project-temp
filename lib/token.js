// JWT-like Token Management
import * as groupSubstitution from './crypto/groupSubstitution.js';
import * as vigenere from './crypto/vigenere.js';
import * as transposition from './crypto/transposition.js';

function base64Encode(str) {
  if (typeof window !== 'undefined') {
    return btoa(str);
  } else {
    return Buffer.from(str).toString('base64');
  }
}

function base64Decode(str) {
  // Add padding if missing
  while (str.length % 4 !== 0) {
    str += '=';
  }
  
  if (typeof window !== 'undefined') {
    return atob(str);
  } else {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
}

export function createToken(payload, vigenereKey = 'SECRETKEY', transpositionKey = '34152') {
  // Create header
  const header = {
    alg: 'CUSTOM',
    typ: 'JWT'
  };
  
  // Add expiration to payload (1 hour from now)
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  // Encrypt each part
  const headerStr = JSON.stringify(header);
  const payloadStr = JSON.stringify(tokenPayload);
  
  // Header: Group Substitution Cipher
  const encryptedHeader = groupSubstitution.encrypt(headerStr);
  const encodedHeader = base64Encode(encryptedHeader).replace(/=/g, '');
  
  // Payload: Vigenère Cipher
  const encryptedPayload = vigenere.encrypt(payloadStr, vigenereKey);
  const encodedPayload = base64Encode(encryptedPayload).replace(/=/g, '');
  
  // Create signature from header + payload
  const signatureData = encodedHeader + '.' + encodedPayload;
  const encryptedSignature = transposition.encrypt(signatureData, transpositionKey);
  const encodedSignature = base64Encode(encryptedSignature).replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export function verifyToken(token, vigenereKey = 'SECRETKEY', transpositionKey = '34152') {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const expectedSignatureData = encodedHeader + '.' + encodedPayload;
    const decryptedSignature = transposition.decrypt(
      base64Decode(encodedSignature),
      transpositionKey
    );
    
    if (decryptedSignature !== expectedSignatureData) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Decrypt payload
    const encryptedPayload = base64Decode(encodedPayload);
    const payloadStr = vigenere.decrypt(encryptedPayload, vigenereKey);
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Token decryption failed: ' + error.message };
  }
}

export function decodeToken(token, vigenereKey = 'SECRETKEY') {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid token format' };
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Decrypt header
    const encryptedHeader = base64Decode(encodedHeader);
    const headerStr = groupSubstitution.decrypt(encryptedHeader);
    const header = JSON.parse(headerStr);
    
    // Decrypt payload
    const encryptedPayload = base64Decode(encodedPayload);
    const payloadStr = vigenere.decrypt(encryptedPayload, vigenereKey);
    const payload = JSON.parse(payloadStr);
    
    return { header, payload, signature: encodedSignature };
  } catch (error) {
    return { error: 'Failed to decode token: ' + error.message };
  }
}
