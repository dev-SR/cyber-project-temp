#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for JWT-like Token System with Custom Encryption
Tests all endpoints: register, login, verify, payment, dh/generate, dh/shared-secret
"""

import requests
import json
import sys
import time
from datetime import datetime

# Backend URL from environment
BASE_URL = "https://ciphersaas.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.tokens = {}
        self.dh_keys = {}
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_register_valid(self):
        """Test valid user registration"""
        test_name = "POST /api/register - Valid Registration"
        
        # Use unique email to avoid conflicts
        timestamp = int(time.time())
        payload = {
            "email": f"newuser{timestamp}@example.com",
            "password": "securepassword123",
            "name": "New Test User"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/register", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and 'token' in data:
                    # Store token for later tests
                    self.tokens['valid'] = data['token']
                    self.log_test(test_name, True, 
                                f"User created with ID: {data['user']['id']}, Token received")
                else:
                    self.log_test(test_name, False, 
                                "Missing user or token in response", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        test_name = "POST /api/register - Duplicate Email"
        
        payload = {
            "email": "test@example.com",  # This email already exists in users.json
            "password": "password123",
            "name": "Duplicate User"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/register", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'already exists' in data['error'].lower():
                    self.log_test(test_name, True, 
                                "Correctly rejected duplicate email")
                else:
                    self.log_test(test_name, False, 
                                "Wrong error message", data)
            else:
                self.log_test(test_name, False, 
                            f"Expected 400, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_register_missing_fields(self):
        """Test registration with missing required fields"""
        test_name = "POST /api/register - Missing Fields"
        
        payload = {
            "email": "incomplete@example.com",
            # Missing password and name
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/register", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'missing' in data['error'].lower():
                    self.log_test(test_name, True, 
                                "Correctly rejected missing fields")
                else:
                    self.log_test(test_name, False, 
                                "Wrong error message", data)
            else:
                self.log_test(test_name, False, 
                            f"Expected 400, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_login_valid(self):
        """Test valid user login"""
        test_name = "POST /api/login - Valid Login"
        
        payload = {
            "email": "test@example.com",
            "password": "password123"  # Base64 decoded from users.json: cGFzc3dvcmQxMjM=
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and 'token' in data:
                    # Store token for later tests
                    self.tokens['login'] = data['token']
                    self.log_test(test_name, True, 
                                f"Login successful for user: {data['user']['email']}")
                else:
                    self.log_test(test_name, False, 
                                "Missing user or token in response", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        test_name = "POST /api/login - Invalid Credentials"
        
        payload = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/login", json=payload)
            
            if response.status_code == 401:
                data = response.json()
                if 'error' in data and 'invalid' in data['error'].lower():
                    self.log_test(test_name, True, 
                                "Correctly rejected invalid credentials")
                else:
                    self.log_test(test_name, False, 
                                "Wrong error message", data)
            else:
                self.log_test(test_name, False, 
                            f"Expected 401, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_login_missing_fields(self):
        """Test login with missing fields"""
        test_name = "POST /api/login - Missing Fields"
        
        payload = {
            "email": "test@example.com"
            # Missing password
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/login", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'missing' in data['error'].lower():
                    self.log_test(test_name, True, 
                                "Correctly rejected missing fields")
                else:
                    self.log_test(test_name, False, 
                                "Wrong error message", data)
            else:
                self.log_test(test_name, False, 
                            f"Expected 400, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_verify_valid_token(self):
        """Test token verification with valid token"""
        test_name = "POST /api/verify - Valid Token"
        
        # Use token from login test
        token = self.tokens.get('login') or self.tokens.get('valid')
        if not token:
            self.log_test(test_name, False, "No valid token available from previous tests")
            return
            
        payload = {
            "token": token
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/verify", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'valid' in data and data['valid'] == True:
                    self.log_test(test_name, True, 
                                f"Token verified successfully, payload: {data.get('payload', {}).get('email', 'N/A')}")
                else:
                    self.log_test(test_name, False, 
                                "Token verification failed", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_verify_invalid_token(self):
        """Test token verification with invalid token"""
        test_name = "POST /api/verify - Invalid Token"
        
        payload = {
            "token": "invalid.token.here"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/verify", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'valid' in data and data['valid'] == False:
                    self.log_test(test_name, True, 
                                f"Invalid token correctly rejected: {data.get('error', 'N/A')}")
                else:
                    self.log_test(test_name, False, 
                                "Invalid token was accepted", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_verify_missing_token(self):
        """Test token verification with missing token"""
        test_name = "POST /api/verify - Missing Token"
        
        payload = {}
        
        try:
            response = self.session.post(f"{BASE_URL}/verify", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'required' in data['error'].lower():
                    self.log_test(test_name, True, 
                                "Correctly rejected missing token")
                else:
                    self.log_test(test_name, False, 
                                "Wrong error message", data)
            else:
                self.log_test(test_name, False, 
                            f"Expected 400, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_payment_demo_method(self):
        """Test payment with demo method"""
        test_name = "POST /api/payment - Demo Payment"
        
        # Use token from login test
        token = self.tokens.get('login') or self.tokens.get('valid')
        if not token:
            self.log_test(test_name, False, "No valid token available from previous tests")
            return
            
        payload = {
            "token": token,
            "tier": "premium",
            "paymentMethod": "demo"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/payment", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True and 'demo' in data.get('message', '').lower():
                    # Store new token
                    if 'token' in data:
                        self.tokens['premium'] = data['token']
                    self.log_test(test_name, True, 
                                f"Demo payment successful, subscription: {data.get('subscription', 'N/A')}")
                else:
                    self.log_test(test_name, False, 
                                "Demo payment failed", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_payment_stripe_method(self):
        """Test payment with Stripe method (should fail gracefully without API key)"""
        test_name = "POST /api/payment - Stripe Payment (No API Key)"
        
        # Use token from login test
        token = self.tokens.get('login') or self.tokens.get('valid')
        if not token:
            self.log_test(test_name, False, "No valid token available from previous tests")
            return
            
        payload = {
            "token": token,
            "tier": "premium",
            "paymentMethod": "stripe"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/payment", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'stripe not configured' in data.get('error', '').lower():
                    self.log_test(test_name, True, 
                                "Stripe payment correctly failed without API key")
                else:
                    self.log_test(test_name, False, 
                                "Wrong error message for missing Stripe key", data)
            else:
                self.log_test(test_name, False, 
                            f"Expected 400, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_payment_invalid_token(self):
        """Test payment with invalid token"""
        test_name = "POST /api/payment - Invalid Token"
        
        payload = {
            "token": "invalid.token.here",
            "tier": "premium",
            "paymentMethod": "demo"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/payment", json=payload)
            
            if response.status_code == 401:
                data = response.json()
                if 'invalid token' in data.get('error', '').lower():
                    self.log_test(test_name, True, 
                                "Payment correctly rejected invalid token")
                else:
                    self.log_test(test_name, False, 
                                "Wrong error message", data)
            else:
                self.log_test(test_name, False, 
                            f"Expected 401, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_dh_generate_keys(self):
        """Test Diffie-Hellman key pair generation"""
        test_name = "POST /api/dh/generate - Key Generation"
        
        try:
            response = self.session.post(f"{BASE_URL}/dh/generate", json={})
            
            if response.status_code == 200:
                data = response.json()
                if 'publicKey' in data and 'parameters' in data:
                    # Store keys for shared secret test
                    self.dh_keys['party1'] = {
                        'publicKey': data['publicKey'],
                        'parameters': data['parameters']
                    }
                    self.log_test(test_name, True, 
                                f"Key generated - Public: {data['publicKey']}, P: {data['parameters']['P']}, G: {data['parameters']['G']}")
                else:
                    self.log_test(test_name, False, 
                                "Missing publicKey or parameters", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_dh_generate_keys_second_party(self):
        """Test Diffie-Hellman key pair generation for second party"""
        test_name = "POST /api/dh/generate - Second Key Generation"
        
        try:
            response = self.session.post(f"{BASE_URL}/dh/generate", json={})
            
            if response.status_code == 200:
                data = response.json()
                if 'publicKey' in data and 'parameters' in data:
                    # Store keys for shared secret test
                    self.dh_keys['party2'] = {
                        'publicKey': data['publicKey'],
                        'parameters': data['parameters']
                    }
                    self.log_test(test_name, True, 
                                f"Second key generated - Public: {data['publicKey']}")
                else:
                    self.log_test(test_name, False, 
                                "Missing publicKey or parameters", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_dh_shared_secret(self):
        """Test Diffie-Hellman shared secret computation with known values"""
        test_name = "POST /api/dh/shared-secret - Compute Shared Secret"
        
        # Use known values that should work with P=23, G=5
        # If Alice has private key 6, her public key would be 5^6 mod 23 = 8
        # If Bob has private key 15, his public key would be 5^15 mod 23 = 19
        # Shared secret should be 8^15 mod 23 = 19^6 mod 23 = 2
        
        payload = {
            "privateKey": 6,  # Alice's private key
            "otherPublicKey": 19  # Bob's public key (5^15 mod 23)
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/dh/shared-secret", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'sharedSecret' in data:
                    self.dh_keys['shared_secret_1'] = data['sharedSecret']
                    self.log_test(test_name, True, 
                                f"Shared secret computed: {data['sharedSecret']}")
                else:
                    self.log_test(test_name, False, 
                                "Missing sharedSecret in response", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_dh_shared_secret_reverse(self):
        """Test Diffie-Hellman shared secret computation (reverse) with known values"""
        test_name = "POST /api/dh/shared-secret - Reverse Computation"
        
        # Compute from Bob's perspective using the same known values
        # Bob's private key = 15, Alice's public key = 8 (5^6 mod 23)
        # Should get the same shared secret = 2
        
        payload = {
            "privateKey": 15,  # Bob's private key
            "otherPublicKey": 8   # Alice's public key (5^6 mod 23)
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/dh/shared-secret", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'sharedSecret' in data:
                    self.dh_keys['shared_secret_2'] = data['sharedSecret']
                    
                    # Check if both parties get the same shared secret
                    if 'shared_secret_1' in self.dh_keys:
                        if self.dh_keys['shared_secret_1'] == data['sharedSecret']:
                            self.log_test(test_name, True, 
                                        f"Shared secrets match: {data['sharedSecret']}")
                        else:
                            self.log_test(test_name, False, 
                                        f"Shared secrets don't match: {self.dh_keys['shared_secret_1']} vs {data['sharedSecret']}")
                    else:
                        self.log_test(test_name, True, 
                                    f"Reverse shared secret computed: {data['sharedSecret']}")
                else:
                    self.log_test(test_name, False, 
                                "Missing sharedSecret in response", data)
            else:
                self.log_test(test_name, False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 80)
        print("BACKEND API TESTING - JWT-like Token System with Custom Encryption")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print(f"Started at: {datetime.now().isoformat()}")
        print()
        
        # Registration tests
        print("🔐 REGISTRATION TESTS")
        print("-" * 40)
        self.test_register_valid()
        self.test_register_duplicate_email()
        self.test_register_missing_fields()
        
        # Login tests
        print("🔑 LOGIN TESTS")
        print("-" * 40)
        self.test_login_valid()
        self.test_login_invalid_credentials()
        self.test_login_missing_fields()
        
        # Token verification tests
        print("✅ TOKEN VERIFICATION TESTS")
        print("-" * 40)
        self.test_verify_valid_token()
        self.test_verify_invalid_token()
        self.test_verify_missing_token()
        
        # Payment tests
        print("💳 PAYMENT TESTS")
        print("-" * 40)
        self.test_payment_demo_method()
        self.test_payment_stripe_method()
        self.test_payment_invalid_token()
        
        # Diffie-Hellman tests
        print("🔒 DIFFIE-HELLMAN KEY EXCHANGE TESTS")
        print("-" * 40)
        self.test_dh_generate_keys()
        self.test_dh_generate_keys_second_party()
        self.test_dh_shared_secret()
        self.test_dh_shared_secret_reverse()
        
        # Summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("FAILED TESTS:")
            print("-" * 40)
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}")
                    print(f"   {result['details']}")
            print()
        
        print("DETAILED RESULTS:")
        print("-" * 40)
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
        
        print()
        print(f"Testing completed at: {datetime.now().isoformat()}")
        print("=" * 80)

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()