const http = require('http');

const data = JSON.stringify({
  eventId: '69e5d2af53873f2e1cfe946f',
  name: 'Real Test User',
  phone: '9876543210'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/public/events/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
