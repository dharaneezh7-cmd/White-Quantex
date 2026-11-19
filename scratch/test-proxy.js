const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 7000,
  path: '/api/spring/auth/me',
  method: 'GET'
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Proxy Me Status:', res.statusCode, 'Body:', body));
});
req.on('error', console.error);
req.end();
