const http = require('http');

const postData = JSON.stringify({
  orderNumber: 'ORD123456',
  email: 'customer@example.com'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/tracking/track',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Success:', response.success);
      if (response.data) {
        console.log('Order Number:', response.data.orderNumber);
        console.log('Status:', response.data.status);
        console.log('Total Amount:', response.data.totalAmount);
        console.log('Items Count:', response.data.items?.length);
        console.log('Tracking History Count:', response.data.trackingHistory?.length);
        console.log('Updated At:', response.data.updatedAt);
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (err) => console.log('Error:', err.message));
req.write(postData);
req.end();
