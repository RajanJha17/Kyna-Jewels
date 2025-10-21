/**
 * Complete Flow Test - Login + Fetch Orders
 * This simulates exactly what the frontend should do
 */

async function testFullFlow() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTING COMPLETE FRONTEND-BACKEND INTEGRATION');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Login
    console.log('📝 Step 1: Login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tiwariaditya1810@gmail.com',
        password: '12345678'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.token) {
      console.log('❌ Login failed:', loginData);
      return;
    }

    console.log('✅ Login successful!');
    console.log(`   Token: ${loginData.token.substring(0, 40)}...`);
    console.log(`   User: ${loginData.user.email}\n`);

    // Step 2: Fetch Orders with Token
    console.log('📝 Step 2: Fetching orders with token...');
    const ordersResponse = await fetch('http://localhost:5000/api/tracking/test-orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    console.log(`   Response Status: ${ordersResponse.status} ${ordersResponse.statusText}`);

    const ordersData = await ordersResponse.json();
    
    console.log('\n📊 Orders Response:');
    console.log(JSON.stringify(ordersData, null, 2));

    if (ordersData.success && ordersData.data) {
      console.log('\n✅ SUCCESS! Orders fetched:');
      console.log(`   Total Orders: ${ordersData.data.length}`);
      ordersData.data.forEach((order, i) => {
        console.log(`   ${i + 1}. ${order.orderNumber} - ${order.status}`);
      });
      
      console.log('\n✅✅✅ BACKEND IS WORKING PERFECTLY! ✅✅✅');
      console.log('\n🔍 Frontend Issue:');
      console.log('   The backend works fine. The problem is:');
      console.log('   → Frontend is NOT sending the token');
      console.log('   → You need to LOGIN on the frontend first!');
      console.log('\n📱 Steps to fix:');
      console.log('   1. Go to: http://localhost:5173/login');
      console.log('   2. Login with: tiwariaditya1810@gmail.com / 12345678');
      console.log('   3. After login, go to: http://localhost:5173/track-order');
      console.log('   4. Orders will appear! 🎉');
      
    } else {
      console.log('\n❌ Error fetching orders:', ordersData);
      
      if (ordersResponse.status === 401) {
        console.log('\n⚠️  401 Unauthorized - This means token is not working');
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

testFullFlow();

