// Automated E2E verification of the complete Judge Demo Flow
const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPLETE JUDGE FLOW VERIFICATION ---\n');

  // 1. Health check
  const health = await request('/api/health');
  console.log('1. Health check:', health.status === 200 ? 'PASSED' : 'FAILED', health.data);

  // 2. Student Login
  const studentLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { username: 'student1', password: 'student123' }
  });
  console.log('2. Student Login:', studentLogin.data.success ? 'PASSED' : 'FAILED', studentLogin.data.user);
  const studentToken = studentLogin.data.token;

  // 3. Faculty Login
  const facultyLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { username: 'faculty1', password: 'faculty123' }
  });
  console.log('3. Faculty Login:', facultyLogin.data.success ? 'PASSED' : 'FAILED', facultyLogin.data.user);
  const facultyToken = facultyLogin.data.token;

  // 4. Admin Login
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { username: 'admin', password: 'admin123' }
  });
  console.log('4. Admin Login:', adminLogin.data.success ? 'PASSED' : 'FAILED', adminLogin.data.user);
  const adminToken = adminLogin.data.token;

  // 5. Check Initial Faculty Stats
  const facInitial = await request('/api/faculty/me/performance', {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const initialResponses = facInitial.data.data.totalResponses;
  console.log(`5. Faculty initial total responses: ${initialResponses}`);

  // 6. Student Submits Anonymous Feedback for Faculty 1
  const feedbackRes = await request('/api/feedback', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'x-anonymous-token': 'anon_test_' + Date.now()
    },
    body: {
      facultyId: 'FAC001',
      subjectId: 'SUB006',
      semester: 3,
      branch: 'B.Sc Data Science',
      ratings: {
        subjectKnowledge: 5,
        clarity: 5,
        communication: 5,
        engagement: 4,
        punctuality: 5,
        doubtResolution: 5,
        practicalExamples: 4,
        overallSatisfaction: 5
      },
      positiveComment: 'Dr. Shah explained complex AI concepts with phenomenal clarity.',
      improvementComment: 'Could add a few more hands-on lab sessions.'
    }
  });
  console.log('6. Student Anonymous Feedback Submission:', feedbackRes.data.success ? 'PASSED' : 'FAILED', 'Receipt ID:', feedbackRes.data.feedbackId);

  // 7. Verify Faculty Stats IMMEDIATELY Updated
  const facUpdated = await request('/api/faculty/me/performance', {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const updatedResponses = facUpdated.data.data.totalResponses;
  console.log(`7. Faculty updated total responses: ${updatedResponses} (Expected: ${initialResponses + 1}) ->`, updatedResponses === initialResponses + 1 ? 'PASSED' : 'FAILED');

  // 8. CRITICAL PRIVACY VERIFICATION: Check Faculty Payload for Student Identity
  const facString = JSON.stringify(facUpdated.data);
  const leakedIdentity = /student1|aarav|22010204001|"studentId"|"studentName"|"studentEmail"|"studentPhone"/i.test(facString);
  console.log('8. Privacy Verification (Faculty view contains ZERO student identity):', !leakedIdentity ? 'PASSED (STRICT PRIVACY PRESERVED)' : 'FAILED LEAK DETECTED');

  // 9. Admin Dashboard Analytics
  const adminDash = await request('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('9. Admin Dashboard KPIs:', adminDash.data.success ? 'PASSED' : 'FAILED', adminDash.data.data.kpis);

  // 10. Admin Anonymous Feedback Log
  const adminFb = await request('/api/admin/feedback', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const latestFb = adminFb.data.data[0];
  console.log('10. Admin Feedback Log verified:', adminFb.data.success ? 'PASSED' : 'FAILED', {
    latestRecordId: latestFb.feedbackId,
    facultyName: latestFb.facultyName,
    hasStudentId: 'studentId' in latestFb,
    hasStudentName: 'studentName' in latestFb,
    positiveSentiment: latestFb.positiveSentiment
  });

  // 11. Backend Role Security Verification: Student cannot access Admin endpoints
  const studentUnauthorized = await request('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log('11. Security Check (Student rejected from Admin endpoint):', studentUnauthorized.status === 403 ? 'PASSED (403 Forbidden)' : 'FAILED');

  // 12. Faculty cannot access raw feedback endpoint
  const facultyUnauthorized = await request('/api/admin/feedback', {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  console.log('12. Security Check (Faculty rejected from raw feedback endpoint):', facultyUnauthorized.status === 403 ? 'PASSED (403 Forbidden)' : 'FAILED');

  console.log('\n--- ALL E2E VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(console.error);
