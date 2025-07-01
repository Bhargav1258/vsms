// Test script to verify getAll vehicles endpoint and debug vehicle addition
const API_URL = 'http://localhost:3001/api';

async function testGetAllVehicles() {
  console.log('=== Testing GetAll Vehicles Endpoint ===');
  
  try {
    // Step 1: Test if backend is accessible
    console.log('\n1. Testing backend connectivity...');
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
    
    console.log('Backend status:', response.status);
    
    if (response.status === 200 || response.status === 401) {
      console.log('✅ Backend is accessible');
    } else {
      console.log('❌ Backend returned unexpected status:', response.status);
      return;
    }

    // Step 2: Test getAll vehicles endpoint
    console.log('\n2. Testing getAll vehicles endpoint...');
    
    // You'll need to replace with actual auth token
    const authToken = 'YOUR_AUTH_TOKEN'; // Replace with actual token
    
    const getAllResponse = await fetch(`${API_URL}/vehicles/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GetAll vehicles response status:', getAllResponse.status);
    
    if (getAllResponse.status === 200) {
      const vehicles = await getAllResponse.json();
      console.log('✅ GetAll vehicles successful');
      console.log('Total vehicles in database:', vehicles.length);
      
      if (vehicles.length > 0) {
        console.log('\nVehicles found:');
        vehicles.forEach((vehicle, index) => {
          console.log(`${index + 1}. ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}) - User: ${vehicle.user?.name || 'Unknown'}`);
        });
      } else {
        console.log('No vehicles found in database');
      }
    } else {
      const errorText = await getAllResponse.text();
      console.log('❌ Failed to get all vehicles:', errorText);
    }
    
    // Step 3: Debugging information
    console.log('\n3. Debugging information:');
    console.log('- If vehicles are found in getAll but not in user dashboard, the issue is with:');
    console.log('  a) User authentication/authorization');
    console.log('  b) Frontend not properly calling getByUserId');
    console.log('  c) User ID mismatch');
    console.log('- If no vehicles are found in getAll, the issue is with:');
    console.log('  a) Database connection');
    console.log('  b) Vehicle not being saved properly');
    console.log('  c) Database transaction not committed');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run the test
testGetAllVehicles(); 