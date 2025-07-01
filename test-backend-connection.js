// Test script to verify backend connection after CORS fix
const API_URL = 'http://localhost:3001/api';

async function testBackendConnection() {
  console.log('Testing backend connection...');
  
  try {
    // Test if backend is accessible
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
    
    console.log('Backend response status:', response.status);
    console.log('Backend is accessible!');
    
    if (response.status === 200 || response.status === 401) {
      console.log('✅ Backend is running and responding');
    } else {
      console.log('❌ Backend returned unexpected status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to backend:', error.message);
  }
}

// Run the test
testBackendConnection(); 