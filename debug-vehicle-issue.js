// Debug script to identify vehicle addition issues
const API_URL = 'http://localhost:3001/api';

async function debugVehicleIssue() {
  console.log('=== Vehicle Addition Debug ===\n');
  
  try {
    // Step 1: Test backend connectivity
    console.log('1. Testing backend connectivity...');
    const healthResponse = await fetch(`${API_URL}/auth/login`, { method: 'OPTIONS' });
    console.log('✅ Backend is accessible (OPTIONS returned:', healthResponse.status, ')');
    
    // Step 2: Test login to get a valid token
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@email.com', // Test user from DataInitializer
        password: 'user123'      // Test password from DataInitializer
      })
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed. Please provide valid credentials.');
      console.log('Status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('✅ Login successful');
    console.log('User ID:', userId);
    console.log('Token received:', token ? 'Yes' : 'No');
    
    // Step 3: Check current vehicles for this user
    console.log('\n3. Checking current vehicles for user...');
    const currentVehiclesResponse = await fetch(`${API_URL}/vehicles/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (currentVehiclesResponse.status === 200) {
      const currentVehicles = await currentVehiclesResponse.json();
      console.log('Current vehicles count:', currentVehicles.length);
      currentVehicles.forEach((v, i) => {
        console.log(`  ${i+1}. ${v.make} ${v.model} (${v.licensePlate})`);
      });
    } else {
      console.log('❌ Failed to get current vehicles:', currentVehiclesResponse.status);
    }
    
    // Step 4: Check all vehicles in database
    console.log('\n4. Checking all vehicles in database...');
    const allVehiclesResponse = await fetch(`${API_URL}/vehicles/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (allVehiclesResponse.status === 200) {
      const allVehicles = await allVehiclesResponse.json();
      console.log('Total vehicles in database:', allVehicles.length);
      allVehicles.forEach((v, i) => {
        console.log(`  ${i+1}. ${v.make} ${v.model} (${v.licensePlate}) - User: ${v.user?.name || 'Unknown'}`);
      });
    } else {
      console.log('❌ Failed to get all vehicles:', allVehiclesResponse.status);
    }
    
    // Step 5: Test adding a new vehicle (use correct endpoint)
    console.log('\n5. Testing vehicle addition...');
    const testVehicle = {
      make: 'TestMake',
      model: 'TestModel',
      year: 2023,
      licensePlate: 'TEST' + Date.now(), // Unique license plate
      vinNumber: 'TESTVIN' + Date.now(),
      mileage: 50000
    };
    
    console.log('Adding vehicle:', testVehicle);
    
    // Use the correct endpoint: POST /api/vehicles/user/{userId}
    const addVehicleResponse = await fetch(`${API_URL}/vehicles/user/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testVehicle)
    });
    
    console.log('Add vehicle response status:', addVehicleResponse.status);
    
    if (addVehicleResponse.status === 200 || addVehicleResponse.status === 201) {
      const addedVehicle = await addVehicleResponse.json();
      console.log('✅ Vehicle added successfully!');
      console.log('Added vehicle ID:', addedVehicle.id);
      console.log('Added vehicle details:', addedVehicle);
      
      // Step 6: Verify the vehicle was actually saved
      console.log('\n6. Verifying vehicle was saved...');
      
      // Check user's vehicles again
      const verifyUserVehiclesResponse = await fetch(`${API_URL}/vehicles/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (verifyUserVehiclesResponse.status === 200) {
        const verifyVehicles = await verifyUserVehiclesResponse.json();
        console.log('Vehicles after addition:', verifyVehicles.length);
        const foundVehicle = verifyVehicles.find(v => v.licensePlate === testVehicle.licensePlate);
        if (foundVehicle) {
          console.log('✅ Vehicle found in user\'s vehicles!');
        } else {
          console.log('❌ Vehicle NOT found in user\'s vehicles!');
        }
      }
      
      // Check all vehicles again
      const verifyAllVehiclesResponse = await fetch(`${API_URL}/vehicles/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (verifyAllVehiclesResponse.status === 200) {
        const verifyAllVehicles = await verifyAllVehiclesResponse.json();
        console.log('Total vehicles after addition:', verifyAllVehicles.length);
        const foundInAll = verifyAllVehicles.find(v => v.licensePlate === testVehicle.licensePlate);
        if (foundInAll) {
          console.log('✅ Vehicle found in all vehicles!');
        } else {
          console.log('❌ Vehicle NOT found in all vehicles!');
        }
      }
      
    } else {
      const errorText = await addVehicleResponse.text();
      console.log('❌ Failed to add vehicle');
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

// Run the debug
debugVehicleIssue(); 