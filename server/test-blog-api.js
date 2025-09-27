/**
 * Blog API Test Script
 * 
 * This script tests all blog API endpoints to ensure they work correctly.
 * Make sure the server is running before executing this script.
 * 
 * Usage: node test-blog-api.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/blogs';

// Test data
const testBlog = {
  title: 'Test Blog Post',
  notes: 'This is a test blog post created by the API test script. It contains enough content to pass validation requirements.'
};

let createdBlogId = null;

// Helper function to create a simple test image
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  // Create a simple 1x1 pixel JPEG file for testing
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xAA, 0xFF, 0xD9
  ]);
  
  fs.writeFileSync(testImagePath, jpegHeader);
  return testImagePath;
}

// Test functions
async function testCreateBlog() {
  console.log('\n🧪 Testing CREATE Blog API...');
  
  try {
    const formData = new FormData();
    formData.append('title', testBlog.title);
    formData.append('notes', testBlog.notes);
    
    // Create and add test image
    const testImagePath = createTestImage();
    formData.append('displayImage', fs.createReadStream(testImagePath));
    
    const response = await axios.post(BASE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    if (response.data.success) {
      createdBlogId = response.data.data._id;
      console.log('✅ CREATE Blog: SUCCESS');
      console.log(`   Blog ID: ${createdBlogId}`);
      console.log(`   Title: ${response.data.data.title}`);
    } else {
      console.log('❌ CREATE Blog: FAILED');
      console.log('   Response:', response.data);
    }
    
    // Clean up test image
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.log('❌ CREATE Blog: ERROR');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testGetAllBlogs() {
  console.log('\n🧪 Testing GET All Blogs API...');
  
  try {
    const response = await axios.get(BASE_URL);
    
    if (response.data.success) {
      console.log('✅ GET All Blogs: SUCCESS');
      console.log(`   Total blogs: ${response.data.data.pagination.total}`);
      console.log(`   Current page: ${response.data.data.pagination.page}`);
    } else {
      console.log('❌ GET All Blogs: FAILED');
      console.log('   Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ GET All Blogs: ERROR');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testGetBlogById() {
  console.log('\n🧪 Testing GET Blog by ID API...');
  
  if (!createdBlogId) {
    console.log('❌ GET Blog by ID: SKIPPED (No blog ID available)');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/${createdBlogId}`);
    
    if (response.data.success) {
      console.log('✅ GET Blog by ID: SUCCESS');
      console.log(`   Blog ID: ${response.data.data._id}`);
      console.log(`   Title: ${response.data.data.title}`);
    } else {
      console.log('❌ GET Blog by ID: FAILED');
      console.log('   Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ GET Blog by ID: ERROR');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testUpdateBlog() {
  console.log('\n🧪 Testing UPDATE Blog API...');
  
  if (!createdBlogId) {
    console.log('❌ UPDATE Blog: SKIPPED (No blog ID available)');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('title', 'Updated Test Blog Post');
    formData.append('notes', 'This is an updated test blog post with new content.');
    
    const response = await axios.put(`${BASE_URL}/${createdBlogId}`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    if (response.data.success) {
      console.log('✅ UPDATE Blog: SUCCESS');
      console.log(`   Updated Title: ${response.data.data.title}`);
    } else {
      console.log('❌ UPDATE Blog: FAILED');
      console.log('   Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ UPDATE Blog: ERROR');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testSearchBlogs() {
  console.log('\n🧪 Testing SEARCH Blogs API...');
  
  try {
    const response = await axios.get(`${BASE_URL}/search?q=test`);
    
    if (response.data.success) {
      console.log('✅ SEARCH Blogs: SUCCESS');
      console.log(`   Search results: ${response.data.data.pagination.total}`);
    } else {
      console.log('❌ SEARCH Blogs: FAILED');
      console.log('   Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ SEARCH Blogs: ERROR');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testDeleteBlog() {
  console.log('\n🧪 Testing DELETE Blog API...');
  
  if (!createdBlogId) {
    console.log('❌ DELETE Blog: SKIPPED (No blog ID available)');
    return;
  }
  
  try {
    const response = await axios.delete(`${BASE_URL}/${createdBlogId}`);
    
    if (response.data.success) {
      console.log('✅ DELETE Blog: SUCCESS');
      console.log('   Blog deleted successfully');
    } else {
      console.log('❌ DELETE Blog: FAILED');
      console.log('   Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ DELETE Blog: ERROR');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...');
  
  try {
    // Test with missing required fields
    const formData = new FormData();
    formData.append('title', 'Short'); // Too short
    
    await axios.post(BASE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('❌ Validation Test: FAILED (Should have thrown error)');
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation Test: SUCCESS');
      console.log('   Validation errors properly caught');
    } else {
      console.log('❌ Validation Test: UNEXPECTED ERROR');
      console.log('   Error:', error.response?.data || error.message);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Blog API Tests...');
  console.log(`📡 Testing against: ${BASE_URL}`);
  
  // Check if server is running
  try {
    await axios.get('http://localhost:5000/api/test');
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('   Run: npm run dev');
    process.exit(1);
  }
  
  // Run all tests
  await testCreateBlog();
  await testGetAllBlogs();
  await testGetBlogById();
  await testUpdateBlog();
  await testSearchBlogs();
  await testValidationErrors();
  await testDeleteBlog();
  
  console.log('\n🎉 Blog API Tests Completed!');
  console.log('\n📋 Summary:');
  console.log('   - All CRUD operations tested');
  console.log('   - Image upload functionality tested');
  console.log('   - Validation errors tested');
  console.log('   - Search functionality tested');
  console.log('\n💡 To test with real images, use Postman or a REST client');
  console.log('   with the endpoints documented in BLOG_API_DOCUMENTATION.md');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testCreateBlog,
  testGetAllBlogs,
  testGetBlogById,
  testUpdateBlog,
  testSearchBlogs,
  testDeleteBlog,
  testValidationErrors
};
