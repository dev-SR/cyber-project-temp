// Group Substitution Cipher for Header Encryption
// Each character maps to a group of characters
// Using | as group delimiter

const SUBSTITUTION_MAP = {
  'A': 'Z+ZZ', 'B': 'Y+YY', 'C': 'X+XX', 'D': 'W+WW', 'E': 'V+VV',
  'F': 'U+UU', 'G': 'T+TT', 'H': 'S+SS', 'I': 'R+RR', 'J': 'Q+QQ',
  'K': 'P+PP', 'L': 'O+OO', 'M': 'N+NN', 'N': 'M+MM', 'O': 'L+LL',
  'P': 'K+KK', 'Q': 'J+JJ', 'R': 'I+II', 'S': 'H+HH', 'T': 'G+GG',
  'U': 'F+FF', 'V': 'E+EE', 'W': 'D+DD', 'X': 'C+CC', 'Y': 'B+BB',
  'Z': 'A+AA', '0': '9+99', '1': '8+88', '2': '7+77', '3': '6+66',
  '4': '5+55', '5': '4+44', '6': '3+33', '7': '2+22', '8': '1+11',
  '9': '0+00', ' ': '_+__', '.': '-+--', ',': '*+**', ':': '#+##',
  '{': '[+[[', '}': ']+]]', '"': "'+'''", 'a': 'z+zz', 'b': 'y+yy',
  'c': 'x+xx', 'd': 'w+ww', 'e': 'v+vv', 'f': 'u+uu', 'g': 't+tt',
  'h': 's+ss', 'i': 'r+rr', 'j': 'q+qq', 'k': 'p+pp', 'l': 'o+oo',
  'm': 'n+nn', 'n': 'm+mm', 'o': 'l+ll', 'p': 'k+kk', 'q': 'j+jj',
  'r': 'i+ii', 's': 'h+hh', 't': 'g+gg', 'u': 'f+ff', 'v': 'e+ee',
  'w': 'd+dd', 'x': 'c+cc', 'y': 'b+bb', 'z': 'a+aa'
};

// Create reverse map for decryption
const REVERSE_MAP = {};
for (const [key, value] of Object.entries(SUBSTITUTION_MAP)) {
  REVERSE_MAP[value] = key;
}

export function encrypt(plaintext) {
  const groups = [];
  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    if (SUBSTITUTION_MAP[char]) {
      groups.push(SUBSTITUTION_MAP[char]);
    } else {
      // For unmapped characters, use a default pattern
      groups.push(char + '+' + char + char);
    }
  }
  return groups.join('|');
}

export function decrypt(ciphertext) {
  let decrypted = '';
  const groups = ciphertext.split('|');
  
  for (const group of groups) {
    if (REVERSE_MAP[group]) {
      decrypted += REVERSE_MAP[group];
    } else {
      // Handle unmapped groups - extract first character before +
      const parts = group.split('+');
      if (parts.length > 0) {
        decrypted += parts[0];
      }
    }
  }
  
  return decrypted;
}
