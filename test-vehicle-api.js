// Simple test for vehicle API
const API_URL = 'http://localhost:3001/api';

async function testVehicleAPI() {
  console.log('=== Testing Vehicle API ===\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'jane@email.com',
        password: 'user123'
      })
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('✅ Login successful, User ID:', userId);
    
    // Step 2: Test adding a vehicle using the Map endpoint
    console.log('\n2. Testing vehicle addition with Map endpoint...');
    const testVehicle = {
      make: 'TestMake',
      model: 'TestModel',
      year: 2023,
      licensePlate: 'TEST' + Date.now(),
      vinNumber: 'TESTVIN' + Date.now(),
      mileage: 50000
    };
    
    const payload = {
      userId: userId,
      vehicle: testVehicle
    };
    
    console.log('Payload:', payload);
    
    const addResponse = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', addResponse.status);
    console.log('Response headers:', Object.fromEntries(addResponse.headers.entries()));
    
    if (addResponse.status === 200 || addResponse.status === 201) {
      const addedVehicle = await addResponse.json();
      console.log('✅ Vehicle added successfully!');
      console.log('Added vehicle:', addedVehicle);
    } else {
      const errorText = await addResponse.text();
      console.log('❌ Failed to add vehicle');
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testVehicleAPI(); 