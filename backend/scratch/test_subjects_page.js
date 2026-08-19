const http = require('http');

function checkRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Route ${path} returned status 200 OK`);
          resolve(true);
        } else {
          console.error(`❌ Route ${path} returned status ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Request error for ${path}:`, err.message);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log("Testing Subjects React Routes...");
  await checkRoute("/subjects");
  await checkRoute("/subjects/mathematics");
  await checkRoute("/subjects/science");
  console.log("Done.");
  process.exit(0);
}

runTests();
