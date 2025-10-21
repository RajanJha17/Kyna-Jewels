/**
 * Simple Login Test
 * Tests if login returns a token
 */

const credentials = {
  email: 'tiwariaditya1810@gmail.com',
  password: '12345678' // Update this if different
};

async function testLogin() {
  console.log('\n🧪 Testing Login API...\n');
  console.log('📧 Email:', credentials.email);
  console.log('🔑 Password:', credentials.password);
  console.log('');

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));

    if (data.success && data.token) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('🎫 Token:', data.token.substring(0, 50) + '...');
      console.log('👤 User:', data.user?.email);
      console.log('\n✅ Your backend is working correctly!');
      console.log('✅ Now try logging in on the frontend at: http://localhost:5173/login');
    } else {
      console.log('\n❌ LOGIN FAILED');
      console.log('Error:', data.message || 'Unknown error');
      
      if (data.message?.includes('Invalid credentials')) {
        console.log('\n⚠️  The password might be wrong. Try these:');
        console.log('   - 12345678');
        console.log('   - Or check your actual password');
      }
    }

  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Backend server is running on port 5000');
    console.log('   2. MongoDB is running');
    console.log('   3. Run: npm run dev (in server folder)');
  }
}

console.log('='.repeat(60));
console.log('🚀 KYNA JEWELS - LOGIN TEST');
console.log('='.repeat(60));

testLogin();

