const http = require('http');

http.get('http://localhost:5000/api/auth/login', () => {});

const req = http.request('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    const pReq = http.request('http://localhost:5000/api/faculty/me/performance', {
      headers: { Authorization: `Bearer ${token}` }
    }, (pRes) => {
      let pBody = '';
      pRes.on('data', c => pBody += c);
      pRes.on('end', () => {
        const perf = JSON.parse(pBody);
        console.log('Keys in faculty performance:', Object.keys(perf.data));
        console.log('Does payload contain student1?:', pBody.includes('student1'));
        console.log('Does payload contain studentId?:', pBody.includes('studentId'));
        console.log('Does payload contain studentName?:', pBody.includes('studentName'));
        console.log('Does payload contain email?:', pBody.includes('email'));
        console.log('Does payload contain phone?:', pBody.includes('phone'));
      });
    });
    pReq.end();
  });
});
req.write(JSON.stringify({ username: 'faculty1', password: 'faculty123' }));
req.end();
