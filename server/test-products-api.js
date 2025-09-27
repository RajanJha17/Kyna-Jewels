const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testProductId = '64f8a1b2c3d4e5f6a7b8c9d0'; // Sample product ID
const testAttributes = {
  diamondShape: 'RD',
  diamondSize: 0.70,
  tone: '2T',
  metal: 'RG',
  finish: 'BR',
  karat: 18
};

async function testProductsAPI() {
  console.log('🧪 Testing Products API Backend...\n');
  
  try {
    // Test 1: Get all products (paginated)
    console.log('1️⃣ Testing GET /api/products');
    console.log('Request: GET /api/products?page=1&limit=5&category=rings');
    
    try {
      const response1 = await axios.get(`${BASE_URL}/products?page=1&limit=5&category=rings`);
      console.log('✅ Response Status:', response1.status);
      console.log('📊 Response Data:', JSON.stringify(response1.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test 2: Get product price with attributes
    console.log('2️⃣ Testing GET /api/products/:id/price');
    console.log('Request: GET /api/products/' + testProductId + '/price');
    console.log('Query Params:', testAttributes);
    
    try {
      const response2 = await axios.get(`${BASE_URL}/products/${testProductId}/price`, {
        params: testAttributes
      });
      console.log('✅ Response Status:', response2.status);
      console.log('💰 Response Data:', JSON.stringify(response2.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test 3: Get product images with attributes
    console.log('3️⃣ Testing GET /api/products/:id/images');
    console.log('Request: GET /api/products/' + testProductId + '/images');
    console.log('Query Params:', testAttributes);
    
    try {
      const response3 = await axios.get(`${BASE_URL}/products/${testProductId}/images`, {
        params: testAttributes
      });
      console.log('✅ Response Status:', response3.status);
      console.log('🖼️ Response Data:', JSON.stringify(response3.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test 4: Get complete product details
    console.log('4️⃣ Testing GET /api/products/:id');
    console.log('Request: GET /api/products/' + testProductId);
    
    try {
      const response4 = await axios.get(`${BASE_URL}/products/${testProductId}`);
      console.log('✅ Response Status:', response4.status);
      console.log('📋 Response Data:', JSON.stringify(response4.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test 5: Search products
    console.log('5️⃣ Testing GET /api/products/search');
    console.log('Request: GET /api/products/search?q=ring&category=rings');
    
    try {
      const response5 = await axios.get(`${BASE_URL}/products/search`, {
        params: { q: 'ring', category: 'rings' }
      });
      console.log('✅ Response Status:', response5.status);
      console.log('🔍 Response Data:', JSON.stringify(response5.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test 6: Get product filters
    console.log('6️⃣ Testing GET /api/products/filters');
    console.log('Request: GET /api/products/filters');
    
    try {
      const response6 = await axios.get(`${BASE_URL}/products/filters`);
      console.log('✅ Response Status:', response6.status);
      console.log('🔧 Response Data:', JSON.stringify(response6.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test 7: Get product BOM details
    console.log('7️⃣ Testing GET /api/products/:id/bom');
    console.log('Request: GET /api/products/' + testProductId + '/bom');
    
    try {
      const response7 = await axios.get(`${BASE_URL}/products/${testProductId}/bom`, {
        params: testAttributes
      });
      console.log('✅ Response Status:', response7.status);
      console.log('📊 BOM Response Data:', JSON.stringify(response7.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Products API Testing Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testProductsAPI();
