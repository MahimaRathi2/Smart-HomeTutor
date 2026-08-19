const http = require('http');
const fs = require('fs');
const path = require('path');

async function testPublicTutorRegistration() {
  console.log("Testing POST /api/tutor/profile without authentication token...");

  // Build multipart form-data boundary
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  
  let body = '';
  const addField = (name, value) => {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${name}"\r\n\r\n`;
    body += `${value}\r\n`;
  };

  addField('fullName', 'Public Tutor Test');
  addField('email', 'publictutor2026@gmail.com');
  addField('mobile', '9876543210');
  addField('gender', 'Male');
  addField('city', 'New Delhi');
  addField('highestQualification', 'M.Tech Computer Science');
  addField('teachingArea', 'South Delhi');
  addField('expectedFee', '500');
  addField('declarationAccepted', 'true');
  body += `--${boundary}--\r\n`;

  const req = http.request('http://localhost:5000/api/tutor/profile', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('HTTP Response Status:', res.statusCode);
      console.log('Response Body:', data);
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('✅ PUBLIC TUTOR REGISTRATION SUBMISSION PASSED!');
        process.exit(0);
      } else {
        console.error('❌ SUBMISSION FAILED!');
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Request Error:', err);
    process.exit(1);
  });

  req.write(body);
  req.end();
}

testPublicTutorRegistration();
