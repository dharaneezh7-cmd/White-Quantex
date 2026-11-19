const http = require('http');

function post(path, body, cookie = '') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(cookie ? { 'Cookie': cookie } : {})
      }
    }, res => {
      let resBody = '';
      res.on('data', d => resBody += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: resBody }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, cookie = '', authHeader = '') {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (cookie) headers['Cookie'] = cookie;
    if (authHeader) headers['Authorization'] = authHeader;
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers
    }, res => {
      let resBody = '';
      res.on('data', d => resBody += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: resBody }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- TEST 1: Register new user ---');
  const email = `testuser_${Date.now()}@example.com`;
  const regRes = await post('/api/auth/register', {
    firstName: 'Jane',
    lastName: 'Doe',
    email: email,
    password: 'Password123!',
    role: 'FOUNDER'
  });
  console.log('Register Status:', regRes.status);
  console.log('Register Set-Cookie:', regRes.headers['set-cookie']);
  console.log('Register Body:', regRes.body);

  const cookie = regRes.headers['set-cookie'] ? regRes.headers['set-cookie'][0].split(';')[0] : '';
  const authHeader = regRes.headers['authorization'];
  console.log('\nCaptured cookie:', cookie);
  console.log('Captured authHeader:', authHeader);

  console.log('\n--- TEST 2: GET /api/auth/me with Cookie ---');
  const meRes = await get('/api/auth/me', cookie);
  console.log('Me Status:', meRes.status);
  console.log('Me Body:', meRes.body);

  console.log('\n--- TEST 3: Login ---');
  const loginRes = await post('/api/auth/login', {
    email: email,
    password: 'Password123!'
  });
  console.log('Login Status:', loginRes.status);
  console.log('Login Body:', loginRes.body);

  console.log('\n--- TEST 4: Login with bad password ---');
  const badLogin = await post('/api/auth/login', {
    email: email,
    password: 'WrongPassword'
  });
  console.log('Bad Login Status:', badLogin.status);
  console.log('Bad Login Body:', badLogin.body);

  console.log('\n--- TEST 5: Verify OTP ---');
  const otpRes = await post('/api/auth/verify-otp', {
    email: email,
    otp: '123456'
  });
  console.log('Verify OTP Status:', otpRes.status);
  console.log('Verify OTP Body:', otpRes.body);

  console.log('\n--- TEST 6: Protected endpoint /api/user/positions or /api/explore/investments/user ---');
  const protRes = await get('/api/explore/investments/user', cookie);
  console.log('Investments Status:', protRes.status);
  console.log('Investments Body:', protRes.body);
}

run().catch(console.error);
