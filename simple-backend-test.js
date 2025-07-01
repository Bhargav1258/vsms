// Simple test to check backend status
const API_URL = 'http://localhost:3001/api';

async function testBackend() {
  console.log('=== Simple Backend Test ===');
  
  try {
    // Test 1: Check if backend is running
    console.log('\n1. Testing if backend is running...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.status === 200) {
      console.log('✅ Backend is running and responding');
      const data = await response.json();
      console.log('Response data:', data);
    } else if (response.status === 401) {
      console.log('✅ Backend is running (401 is expected for invalid credentials)');
    } else if (response.status === 400) {
      console.log('⚠️ Backend is running but returned 400 (Bad Request)');
      const errorText = await response.text();
      console.log('Error details:', errorText);
    } else {
      console.log('❌ Backend returned unexpected status:', response.status);
    }
    
    // Test 2: Check if we can reach the backend at all
    console.log('\n2. Testing basic connectivity...');
    try {
      const healthResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'OPTIONS'
      });
      console.log('OPTIONS request status:', healthResponse.status);
    } catch (error) {
      console.log('❌ Cannot reach backend at all:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.log('This might mean:');
    console.log('- Backend is not running');
    console.log('- Backend is running on a different port');
    console.log('- There\'s a network connectivity issue');
  }
}

// Run the test
testBackend(); 