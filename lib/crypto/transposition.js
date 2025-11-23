// Transposition Cipher for Signature Encryption
// Rearranges characters based on a numeric key

export function encrypt(plaintext, key = '34152') {
  const keyArray = key.split('').map(Number);
  const numCols = keyArray.length;
  const numRows = Math.ceil(plaintext.length / numCols);
  
  // Create grid
  const grid = [];
  let textIndex = 0;
  
  for (let row = 0; row < numRows; row++) {
    grid[row] = [];
    for (let col = 0; col < numCols; col++) {
      if (textIndex < plaintext.length) {
        grid[row][col] = plaintext[textIndex++];
      } else {
        grid[row][col] = 'X'; // Padding
      }
    }
  }
  
  // Read columns in key order
  let encrypted = '';
  const sortedKey = keyArray.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  
  for (const { idx } of sortedKey) {
    for (let row = 0; row < numRows; row++) {
      encrypted += grid[row][idx];
    }
  }
  
  return encrypted;
}

export function decrypt(ciphertext, key = '34152') {
  const keyArray = key.split('').map(Number);
  const numCols = keyArray.length;
  const numRows = Math.ceil(ciphertext.length / numCols);
  
  // Create empty grid
  const grid = Array(numRows).fill(null).map(() => Array(numCols).fill(''));
  
  // Determine column order
  const sortedKey = keyArray.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  
  // Fill grid column by column in sorted key order
  let textIndex = 0;
  for (const { idx } of sortedKey) {
    for (let row = 0; row < numRows; row++) {
      if (textIndex < ciphertext.length) {
        grid[row][idx] = ciphertext[textIndex++];
      }
    }
  }
  
  // Read grid row by row
  let decrypted = '';
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (grid[row][col] !== 'X' || row < numRows - 1) {
        decrypted += grid[row][col];
      }
    }
  }
  
  // Remove padding
  return decrypted.replace(/X+$/, '');
}
