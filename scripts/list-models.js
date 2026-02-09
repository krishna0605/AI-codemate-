const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // Read .env file manually to get the key
    const envPath = path.resolve(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);

    if (!match) {
      console.error('GEMINI_API_KEY not found in .env');
      return;
    }

    const apiKey = match[1].trim();
    console.log('Using API Key:', apiKey.substring(0, 5) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Just to get the client

    // There isn't a direct "listModels" on the client instance easily accessible in all versions,
    // but we can try to use the fallback REST call if SDK fails, or just try a standard set.
    // Actually, newer SDKs might expose it differently.
    // Let's try a simple generation with 'gemini-pro' as a fallback test first.

    console.log('Testing gemini-pro...');
    try {
      const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await modelPro.generateContent('Hi');
      console.log('gemini-pro works!');
    } catch (e) {
      console.error('gemini-pro failed:', e.message);
    }

    console.log('Testing gemini-1.5-flash...');
    try {
      const modelFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await modelFlash.generateContent('Hi');
      console.log('gemini-1.5-flash works!');
    } catch (e) {
      console.error('gemini-1.5-flash failed:', e.message);
    }

    // Attempting to list models via fetch if possible
    console.log('Fetching available models list via REST...');
    const listResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (listResp.ok) {
      const data = await listResp.json();
      console.log('Available Models:');
      data.models.forEach((m) => {
        if (
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes('generateContent')
        ) {
          console.log(`- ${m.name}`);
        }
      });
    } else {
      console.error('Failed to list models:', listResp.status, listResp.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
