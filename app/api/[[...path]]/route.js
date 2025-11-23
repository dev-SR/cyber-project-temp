import { NextResponse } from 'next/server';
import { findUser, createUser, updateUser } from '@/lib/db';
import { createToken, verifyToken } from '@/lib/token';
import * as diffieHellman from '@/lib/crypto/diffieHellman';

// Simple password hashing (in production, use bcrypt)
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

export async function POST(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    // Parse body only if content exists
    let body = {};
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    }
    
    // Register endpoint
    if (path === 'register') {
      const { email, password, name } = body;
      
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      const existingUser = findUser(email);
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
      
      const user = createUser({
        email,
        password: hashPassword(password),
        name,
        subscription: 'free'
      });
      
      const token = createToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      });
      
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: user.subscription
        },
        token
      });
    }
    
    // Login endpoint
    if (path === 'login') {
      const { email, password } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Missing email or password' },
          { status: 400 }
        );
      }
      
      const user = findUser(email);
      if (!user || !verifyPassword(password, user.password)) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      const token = createToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      });
      
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: user.subscription
        },
        token
      });
    }
    
    // Verify token endpoint
    if (path === 'verify') {
      const { token } = body;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Token required' },
          { status: 400 }
        );
      }
      
      const result = verifyToken(token);
      return NextResponse.json(result);
    }
    
    // Payment endpoint
    if (path === 'payment') {
      const { token, tier, paymentMethod } = body;
      
      if (!token || !tier) {
        return NextResponse.json(
          { error: 'Token and tier required' },
          { status: 400 }
        );
      }
      
      const verification = verifyToken(token);
      if (!verification.valid) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      const { email } = verification.payload;
      
      // Handle payment method
      if (paymentMethod === 'stripe') {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        
        if (!stripeKey) {
          return NextResponse.json(
            { error: 'Stripe not configured. Please use demo payment.' },
            { status: 400 }
          );
        }
        
        // Simulate Stripe payment
        // In production, you would create a Stripe checkout session here
        const paymentSuccessful = true; // Simulated
        
        if (paymentSuccessful) {
          const updatedUser = updateUser(email, { subscription: tier });
          
          const newToken = createToken({
            userId: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            subscription: updatedUser.subscription
          });
          
          return NextResponse.json({
            success: true,
            message: 'Payment processed via Stripe',
            subscription: tier,
            token: newToken
          });
        }
      } else if (paymentMethod === 'demo') {
        // Demo payment - automatically approve
        const updatedUser = updateUser(email, { subscription: tier });
        
        const newToken = createToken({
          userId: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          subscription: updatedUser.subscription
        });
        
        return NextResponse.json({
          success: true,
          message: 'Demo payment successful',
          subscription: tier,
          token: newToken
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }
    
    // Diffie-Hellman key exchange endpoints
    if (path === 'dh/generate') {
      const keyPair = diffieHellman.generateKeyPair();
      const params = diffieHellman.getPublicParameters();
      return NextResponse.json({
        publicKey: keyPair.publicKey,
        parameters: params
      });
    }
    
    if (path === 'dh/shared-secret') {
      const { privateKey, otherPublicKey } = body;
      const sharedSecret = diffieHellman.computeSharedSecret(privateKey, otherPublicKey);
      return NextResponse.json({ sharedSecret });
    }
    
    return NextResponse.json(
      { error: 'Endpoint not found' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  if (path === 'health') {
    return NextResponse.json({ status: 'ok' });
  }
  
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
