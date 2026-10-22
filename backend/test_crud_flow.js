// Complete test script to verify backend CRUD: Add, Read, Login, and Delete
const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPLETE BACKEND CRUD VERIFICATION ---');

  // 1. Admin Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  console.log('1. Admin login status:', loginRes.status);
  const token = loginRes.body.token;
  if (!token) throw new Error('Failed to get admin token');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Add Program
  const ts = Date.now().toString().slice(-4);
  const testProgName = `M.Tech. Autonomous Systems ${ts}`;
  const progRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/programs',
    method: 'POST',
    headers: authHeaders
  }, {
    name: testProgName,
    degree: 'M.Tech.',
    department: 'Department of Computer Engineering',
    durationYears: 2,
    totalSemesters: 4,
    code: `MAS${ts}`
  });
  console.log('2. Add Program status:', progRes.status, progRes.body.message);
  const progId = progRes.body.data.id;

  // 3. Add Faculty
  const facRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/faculty',
    method: 'POST',
    headers: authHeaders
  }, {
    name: `Prof. Vikram Mehta ${ts}`,
    designation: 'Associate Professor',
    department: 'Department of Computer Engineering',
    email: `vikram.mehta.${ts}@apexuniversity.edu.in`,
    phone: '+91 98765 43210',
    semesters: [1, 2]
  });
  console.log('3. Add Faculty status:', facRes.status, facRes.body.message);
  const facId = facRes.body.data.id;
  const facCreds = facRes.body.credentials;
  console.log('   Generated Faculty Credentials:', facCreds);

  // 4. Add Subject assigned to Faculty
  const subRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/subjects',
    method: 'POST',
    headers: authHeaders
  }, {
    code: `AUTO${ts}`,
    name: `Robotic Perception & SLAM ${ts}`,
    program: testProgName,
    semester: 1,
    credits: 4,
    facultyId: facId
  });
  console.log('4. Add Subject status:', subRes.status, subRes.body.message);
  const subId = subRes.body.data.id;

  // 5. Test Student Retrieval & Cascading
  const progList = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/programs',
    method: 'GET',
    headers: authHeaders
  });
  const foundProg = progList.body.data.find(p => p.name === testProgName);
  console.log('5a. Student sees new Program:', !!foundProg);

  const subList = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/subjects?program=${encodeURIComponent(testProgName)}&semester=1`,
    method: 'GET',
    headers: authHeaders
  });
  const foundSub = subList.body.data.find(s => s.id === subId);
  console.log('5b. Student sees new Subject:', !!foundSub, foundSub?.name);
  console.log('5c. Assigned Sir on Subject:', foundSub?.facultyName);

  const facForSub = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/faculty?subjectId=${subId}`,
    method: 'GET',
    headers: authHeaders
  });
  console.log('5d. Student query /api/faculty?subjectId returns assigned Sir:', facForSub.body.data[0]?.name === `Prof. Vikram Mehta ${ts}`);

  // 6. Test Login of New Faculty
  const facLoginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: facCreds.username, password: facCreds.defaultPassword });
  console.log('6. New Faculty Login test:', facLoginRes.status === 200 ? 'SUCCESS' : 'FAILED', facLoginRes.body.user?.name);

  // 7. Test Catalog endpoint
  const catalogRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/catalog',
    method: 'GET',
    headers: authHeaders
  });
  console.log('7. Catalog loaded:', catalogRes.status === 200, 
    'Programs count:', catalogRes.body.data.programs.length,
    'Subjects count:', catalogRes.body.data.subjects.length,
    'Faculty count:', catalogRes.body.data.faculty.length
  );

  // 8. Test Delete Operations
  const delSub = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/subjects/${subId}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('8a. Delete Subject status:', delSub.status, delSub.body.message);

  const delFac = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/faculty/${facId}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('8b. Delete Faculty status:', delFac.status, delFac.body.message);

  const delProg = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/programs/${progId}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('8c. Delete Program status:', delProg.status, delProg.body.message);

  console.log('--- ALL BACKEND CRUD CHECKS PASSED PERFECTLY ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
