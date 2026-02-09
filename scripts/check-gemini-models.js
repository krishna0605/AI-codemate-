const https = require('https');

const apiKey = 'AIzaSyAEUt40SpYvy2GYKv_u66iieT-ved2umFc'; // Hardcoded for this test script based on .env
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https
  .get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.error) {
          console.error('API Error:', json.error);
        } else {
          console.log('Available Models:');
          if (json.models) {
            json.models.forEach((m) => {
              if (
                m.supportedGenerationMethods &&
                m.supportedGenerationMethods.includes('generateContent')
              ) {
                console.log(`- ${m.name}`);
              }
            });
          } else {
            console.log('No models found or different response format:', json);
          }
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
        console.log('Raw response:', data);
      }
    });
  })
  .on('error', (err) => {
    console.error('Network Error:', err);
  });
