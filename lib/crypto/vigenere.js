// Vigenère Cipher for Payload Encryption
// Polyalphabetic substitution cipher using a key

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?-_';

export function encrypt(plaintext, key = 'SECRETKEY') {
  let encrypted = '';
  let keyIndex = 0;
  
  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const charIndex = ALPHABET.indexOf(char);
    
    if (charIndex !== -1) {
      const keyChar = key[keyIndex % key.length];
      const keyCharIndex = ALPHABET.indexOf(keyChar.toUpperCase());
      
      // Shift character by key character position
      const newIndex = (charIndex + keyCharIndex) % ALPHABET.length;
      encrypted += ALPHABET[newIndex];
      keyIndex++;
    } else {
      encrypted += char;
    }
  }
  
  return encrypted;
}

export function decrypt(ciphertext, key = 'SECRETKEY') {
  let decrypted = '';
  let keyIndex = 0;
  
  for (let i = 0; i < ciphertext.length; i++) {
    const char = ciphertext[i];
    const charIndex = ALPHABET.indexOf(char);
    
    if (charIndex !== -1) {
      const keyChar = key[keyIndex % key.length];
      const keyCharIndex = ALPHABET.indexOf(keyChar.toUpperCase());
      
      // Reverse shift
      let newIndex = (charIndex - keyCharIndex) % ALPHABET.length;
      if (newIndex < 0) newIndex += ALPHABET.length;
      
      decrypted += ALPHABET[newIndex];
      keyIndex++;
    } else {
      decrypted += char;
    }
  }
  
  return decrypted;
}
