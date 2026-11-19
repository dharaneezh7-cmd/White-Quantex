const http = require('http');

function post(path, body, cookie = '') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 7000,
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

function get(path, cookie = '') {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({
      hostname: 'localhost',
      port: 7000,
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
  console.log('--- TEST 1: Register through Vite Proxy ---');
  const email = `proxytester_${Date.now()}@example.com`;
  const reg = await post('/api/spring/auth/register', {
    firstName: 'Proxy',
    lastName: 'User',
    email,
    password: 'Password123!',
    role: 'FOUNDER'
  });
  console.log('Register status:', reg.status);
  console.log('Register set-cookie:', reg.headers['set-cookie']);
  console.log('Register body:', reg.body);

  const cookie = reg.headers['set-cookie'] ? reg.headers['set-cookie'][0].split(';')[0] : '';

  console.log('\n--- TEST 2: GET /api/spring/auth/me with Cookie ---');
  const me = await get('/api/spring/auth/me', cookie);
  console.log('Me status:', me.status);
  console.log('Me body:', me.body);

  console.log('\n--- TEST 3: Login through Vite Proxy ---');
  const logRes = await post('/api/spring/auth/login', {
    email,
    password: 'Password123!'
  });
  console.log('Login status:', logRes.status);
  console.log('Login set-cookie:', logRes.headers['set-cookie']);
  console.log('Login body:', logRes.body);
}

run().catch(console.error);
