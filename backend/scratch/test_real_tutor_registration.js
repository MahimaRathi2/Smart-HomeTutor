const http = require('http');

async function submitRealTutorApplication() {
  console.log("Submitting real tutor application via POST /api/tutor/profile...");

  const boundary = '----WebKitFormBoundaryRealTutor2026';
  let body = '';

  const addField = (name, val) => {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${name}"\r\n\r\n`;
    body += `${val}\r\n`;
  };

  addField('fullName', 'Dr. Ananya Sharma');
  addField('email', 'ananya.sharma@edu.in');
  addField('mobile', '9811223344');
  addField('gender', 'Female');
  addField('city', 'Mumbai');
  addField('highestQualification', 'Ph.D. in Organic Chemistry');
  addField('teachingArea', 'Bandra West');
  addField('expectedFee', '850');
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
      console.log('Submission Status:', res.statusCode);
      console.log('Submission Response:', data);
      process.exit(0);
    });
  });

  req.write(body);
  req.end();
}

submitRealTutorApplication();
