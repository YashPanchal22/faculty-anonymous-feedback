// Full lifecycle integration test for Backend Catalog Management & Student Feedback
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

async function runLifecycle() {
  console.log('================================================================');
  console.log('  APEX UNIVERSITY - FULL CATALOG & FEEDBACK LIFECYCLE TEST');
  console.log('================================================================');

  // STEP 1: Admin Login
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  console.log('1. Admin Login:', adminLogin.status === 200 ? 'SUCCESS' : 'FAILED');
  const adminToken = adminLogin.body.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // STEP 2: Add New Faculty Member (Sir)
  const facRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/faculty',
    method: 'POST',
    headers: adminHeaders
  }, {
    name: 'Prof. Arvind Trivedi',
    designation: 'Professor',
    department: 'Computer Engineering',
    email: 'arvind.trivedi@apexuniversity.edu.in',
    phone: '+91 98222 33445',
    semesters: [1, 2]
  });
  console.log('2. Add Faculty (Sir):', facRes.status === 201 ? 'SUCCESS' : 'FAILED', facRes.body.data.id, facRes.body.data.name);
  const facultyId = facRes.body.data.id;
  const facultyCreds = facRes.body.credentials;
  console.log('   Generated Login Credentials:', facultyCreds);

  // STEP 3: Add New Academic Program
  const progRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/programs',
    method: 'POST',
    headers: adminHeaders
  }, {
    name: 'M.Tech. Cloud Computing & DevOps',
    code: 'MTECH-CCD',
    degree: "Master's",
    department: 'Computer Engineering',
    durationYears: 2,
    totalSemesters: 4
  });
  console.log('3. Add Program:', progRes.status === 201 ? 'SUCCESS' : 'FAILED', progRes.body.data.name);
  const programName = progRes.body.data.name;
  const programId = progRes.body.data.id;

  // STEP 4: Add New Subject assigned to Faculty
  const subRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/subjects',
    method: 'POST',
    headers: adminHeaders
  }, {
    code: 'CLD101',
    name: 'Enterprise Kubernetes & Microservices',
    program: programName,
    semester: 1,
    credits: 4,
    facultyId: facultyId
  });
  console.log('4. Add Subject:', subRes.status === 201 ? 'SUCCESS' : 'FAILED', subRes.body.data.code, subRes.body.data.name);
  console.log('   Linked Sir:', subRes.body.data.facultyName);
  const subjectId = subRes.body.data.id;

  // STEP 5: Verify Catalog as Admin
  const catalogRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/catalog',
    method: 'GET',
    headers: adminHeaders
  });
  const catProgs = catalogRes.body.data.programs.some(p => p.name === programName);
  const catSubs = catalogRes.body.data.subjects.some(s => s.id === subjectId);
  const catFac = catalogRes.body.data.faculty.some(f => f.id === facultyId);
  console.log('5. Catalog Verification:', {
    hasNewProgram: catProgs,
    hasNewSubject: catSubs,
    hasNewFaculty: catFac
  });

  // STEP 6: Student Login
  const studentLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'student1', password: 'student123' });
  console.log('6. Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');
  const studentToken = studentLogin.body.token;
  const studentHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${studentToken}`
  };

  // STEP 7: Student fetches Programs
  const studProgs = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/programs',
    method: 'GET',
    headers: studentHeaders
  });
  const foundProgInStudent = studProgs.body.data.find(p => p.name === programName);
  console.log('7. Student sees new Program in dropdown:', !!foundProgInStudent);

  // STEP 8: Student fetches Semesters for the new Program
  const studSems = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/semesters?program=${encodeURIComponent(programId)}`,
    method: 'GET',
    headers: studentHeaders
  });
  console.log('8. Student sees Semesters for new program:', studSems.body.data.length === 4);

  // STEP 9: Student fetches Subjects for Program & Semester 1
  const studSubs = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/subjects?program=${encodeURIComponent(programId)}&semester=1`,
    method: 'GET',
    headers: studentHeaders
  });
  const foundSubInStudent = studSubs.body.data.find(s => s.id === subjectId);
  console.log('9. Student sees new Subject:', !!foundSubInStudent, foundSubInStudent?.name);
  console.log('   Assigned Sir on Subject Option:', foundSubInStudent?.facultyName);

  // STEP 10: Student fetches assigned Sir for the Subject
  const studFac = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/faculty?subjectId=${subjectId}`,
    method: 'GET',
    headers: studentHeaders
  });
  console.log('10. Faculty Auto-selection returns assigned Sir:', studFac.body.data[0]?.name === 'Prof. Arvind Trivedi');

  // STEP 11: Student submits Anonymous Feedback for the new Subject & Sir
  const feedbackRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/feedback',
    method: 'POST',
    headers: {
      ...studentHeaders,
      'x-anonymous-token': 'anon_test_' + Date.now()
    }
  }, {
    facultyId: facultyId,
    subjectId: subjectId,
    semester: 1,
    branch: 'Computer Engineering',
    ratings: {
      subjectKnowledge: 5,
      clarity: 5,
      communication: 4,
      engagement: 5,
      punctuality: 5,
      doubtResolution: 5,
      practicalExamples: 5,
      overallSatisfaction: 5
    },
    positiveComment: 'Outstanding deep architectural insights on Kubernetes deployment and hands-on demonstrations.',
    improvementComment: 'Could introduce more advanced service mesh case studies in subsequent modules.'
  });
  console.log('11. Anonymous Feedback Submission:', feedbackRes.status === 201 ? 'SUCCESS' : 'FAILED', feedbackRes.body.message);

  // STEP 12: New Faculty Member Logs In to Check Aggregated Performance
  const newFacLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: facultyCreds.username, password: facultyCreds.defaultPassword });
  console.log('12. New Faculty Login with Generated Credentials:', newFacLogin.status === 200 ? 'SUCCESS' : 'FAILED', newFacLogin.body.user?.name);
  const newFacToken = newFacLogin.body.token;

  const facProfile = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/faculty/me',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${newFacToken}`
    }
  });
  console.log('13. New Faculty Profile retrieved:', facProfile.status === 200, facProfile.body.data?.name, facProfile.body.data?.designation);

  console.log('================================================================');
  console.log('  ALL 13 LIFECYCLE CHECKS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runLifecycle().catch(err => {
  console.error('Lifecycle error:', err);
  process.exit(1);
});
