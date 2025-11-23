'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function Home() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState('');

  const decodeToken = () => {
    setError('');
    setDecoded(null);
    setVerification(null);

    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        setError('Invalid token format. Expected 3 parts separated by dots.');
        return;
      }

      // Decode header
      const headerEncrypted = atob(parts[0]);
      const headerDecrypted = groupSubstitutionDecrypt(headerEncrypted);
      const header = JSON.parse(headerDecrypted);

      // Decode payload
      const payloadEncrypted = atob(parts[1]);
      const payloadDecrypted = vigenereDecrypt(payloadEncrypted);
      const payload = JSON.parse(payloadDecrypted);

      setDecoded({ header, payload, signature: parts[2] });

      // Verify signature
      const expectedSigData = parts[0] + '.' + parts[1];
      const signatureDecrypted = transpositionDecrypt(atob(parts[2]));

      if (signatureDecrypted === expectedSigData) {
        const isExpired = payload.exp && payload.exp < Math.floor(Date.now() / 1000);
        setVerification({
          valid: !isExpired,
          message: isExpired ? 'Token expired' : 'Signature verified'
        });
      } else {
        setVerification({ valid: false, message: 'Invalid signature' });
      }
    } catch (err) {
      setError('Failed to decode token: ' + err.message);
    }
  };

  // Client-side decryption functions
  const groupSubstitutionDecrypt = (ciphertext) => {
    const REVERSE_MAP = {
      'Z+ZZ': 'A', 'Y+YY': 'B', 'X+XX': 'C', 'W+WW': 'D', 'V+VV': 'E',
      'U+UU': 'F', 'T+TT': 'G', 'S+SS': 'H', 'R+RR': 'I', 'Q+QQ': 'J',
      'P+PP': 'K', 'O+OO': 'L', 'N+NN': 'M', 'M+MM': 'N', 'L+LL': 'O',
      'K+KK': 'P', 'J+JJ': 'Q', 'I+II': 'R', 'H+HH': 'S', 'G+GG': 'T',
      'F+FF': 'U', 'E+EE': 'V', 'D+DD': 'W', 'C+CC': 'X', 'B+BB': 'Y',
      'A+AA': 'Z', 'z+zz': 'a', 'y+yy': 'b', 'x+xx': 'c', 'w+ww': 'd',
      'v+vv': 'e', 'u+uu': 'f', 't+tt': 'g', 's+ss': 'h', 'r+rr': 'i',
      'q+qq': 'j', 'p+pp': 'k', 'o+oo': 'l', 'n+nn': 'm', 'm+mm': 'n',
      'l+ll': 'o', 'k+kk': 'p', 'j+jj': 'q', 'i+ii': 'r', 'h+hh': 's',
      'g+gg': 't', 'f+ff': 'u', 'e+ee': 'v', 'd+dd': 'w', 'c+cc': 'x',
      'b+bb': 'y', 'a+aa': 'z', '_+__': ' ', '-+--': '.', '*+**': ',',
      '#+##': ':', '[+[[': '{', ']+]]': '}', "'+'''": '"',
      '9+99': '0', '8+88': '1', '7+77': '2', '6+66': '3', '5+55': '4',
      '4+44': '5', '3+33': '6', '2+22': '7', '1+11': '8', '0+00': '9'
    };

    let decrypted = '';
    const groups = ciphertext.split('|');

    for (const group of groups) {
      if (REVERSE_MAP[group]) {
        decrypted += REVERSE_MAP[group];
      } else {
        const parts = group.split('+');
        if (parts.length > 0) {
          decrypted += parts[0];
        }
      }
    }

    return decrypted;
  };

  const vigenereDecrypt = (ciphertext, key = 'SECRETKEY') => {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?-_';
    let decrypted = '';
    let keyIndex = 0;

    for (let i = 0; i < ciphertext.length; i++) {
      const char = ciphertext[i];
      const charIndex = ALPHABET.indexOf(char);

      if (charIndex !== -1) {
        const keyChar = key[keyIndex % key.length];
        const keyCharIndex = ALPHABET.indexOf(keyChar.toUpperCase());
        let newIndex = (charIndex - keyCharIndex) % ALPHABET.length;
        if (newIndex < 0) newIndex += ALPHABET.length;
        decrypted += ALPHABET[newIndex];
        keyIndex++;
      } else {
        decrypted += char;
      }
    }

    return decrypted;
  };

  const transpositionDecrypt = (ciphertext, key = '34152') => {
    const keyArray = key.split('').map(Number);
    const numCols = keyArray.length;
    const numRows = Math.ceil(ciphertext.length / numCols);
    const grid = Array(numRows).fill(null).map(() => Array(numCols).fill(''));
    const sortedKey = keyArray.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);

    let textIndex = 0;
    for (const { idx } of sortedKey) {
      for (let row = 0; row < numRows; row++) {
        if (textIndex < ciphertext.length) {
          grid[row][idx] = ciphertext[textIndex++];
        }
      }
    }

    let decrypted = '';
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        if (grid[row][col] !== 'X' || row < numRows - 1) {
          decrypted += grid[row][col];
        }
      }
    }

    return decrypted.replace(/X+$/, '');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            JWT-like Token Decoder
          </h1>
          <p className="text-gray-300 text-lg">
            Decode and verify custom encrypted tokens with Group Substitution, Vigenère, and Transposition ciphers
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <Link href="/auth">
              <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-0">
                Login / Register
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="bg-pink-600 hover:bg-pink-700 text-white border-0">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Input */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Encoded Token</CardTitle>
              <CardDescription className="text-gray-400">
                Paste your encrypted token here to decode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="eyJhbGc...header.payload.signature"
                className="min-h-[200px] font-mono text-sm bg-slate-900 text-white border-slate-600"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Button
                onClick={decodeToken}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Decode Token
              </Button>
            </CardContent>
          </Card>

          {/* Decoded Output */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Decoded Token</CardTitle>
              <CardDescription className="text-gray-400">
                Decrypted header, payload, and signature verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 bg-red-900 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {verification && (
                <Alert className={`mb-4 ${verification.valid ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'}`}>
                  <AlertDescription className={verification.valid ? 'text-green-200' : 'text-red-200'}>
                    {verification.message}
                  </AlertDescription>
                </Alert>
              )}

              {decoded && (
                <Tabs defaultValue="payload" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="header" className="data-[state=active]:bg-purple-600">Header</TabsTrigger>
                    <TabsTrigger value="payload" className="data-[state=active]:bg-purple-600">Payload</TabsTrigger>
                    <TabsTrigger value="signature" className="data-[state=active]:bg-purple-600">Signature</TabsTrigger>
                  </TabsList>
                  <TabsContent value="header" className="mt-4">
                    <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-auto">
                      {JSON.stringify(decoded.header, null, 2)}
                    </pre>
                    <Badge className="mt-2 bg-purple-600">Group Substitution Cipher</Badge>
                  </TabsContent>
                  <TabsContent value="payload" className="mt-4">
                    <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-auto max-h-[300px]">
                      {JSON.stringify(decoded.payload, null, 2)}
                    </pre>
                    <Badge className="mt-2 bg-pink-600">Vigenère Cipher</Badge>
                    {decoded.payload.exp && (
                      <div className="mt-4 text-gray-400 text-sm">
                        <p>Issued: {formatDate(decoded.payload.iat)}</p>
                        <p>Expires: {formatDate(decoded.payload.exp)}</p>
                        {decoded.payload.subscription && (
                          <p className="mt-2">
                            Subscription: <Badge className="ml-2 bg-blue-600">{decoded.payload.subscription}</Badge>
                          </p>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="signature" className="mt-4">
                    <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-auto break-all">
                      {decoded.signature}
                    </pre>
                    <Badge className="mt-2 bg-indigo-600">Transposition Cipher</Badge>
                  </TabsContent>
                </Tabs>
              )}

              {!decoded && !error && (
                <div className="text-center text-gray-500 py-8">
                  Enter a token above to see decoded output
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Encryption Info */}
        <Card className="mt-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Encryption Methods</CardTitle>
            <CardDescription className="text-gray-400">
              Custom implementation of classical ciphers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 rounded-lg">
                <h3 className="font-semibold text-purple-400 mb-2">Group Substitution</h3>
                <p className="text-sm text-gray-400">Each character is replaced with a predefined group of characters (e.g., T → G+GG)</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg">
                <h3 className="font-semibold text-pink-400 mb-2">Vigenère Cipher</h3>
                <p className="text-sm text-gray-400">Polyalphabetic substitution using a secret key to shift characters</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg">
                <h3 className="font-semibold text-indigo-400 mb-2">Transposition Cipher</h3>
                <p className="text-sm text-gray-400">Characters are rearranged based on a numeric key pattern</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
