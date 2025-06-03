import { getCachedLogoBase64 } from './lib/logo-base64.js';
import fs from 'fs';

// Test the base64 logo generation
const base64Logo = getCachedLogoBase64();

if (base64Logo) {
  console.log('Logo successfully converted to base64!');
  console.log('Base64 string length:', base64Logo.length);
  console.log('First 100 characters:', base64Logo.substring(0, 100) + '...');
  
  // Create a test HTML file to verify the base64 image works
  const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Logo Test</title>
</head>
<body style="background-color: #f5f5f5; padding: 50px;">
  <div style="text-align: center;">
    <h2>Base64 Logo Test</h2>
    <img src="${base64Logo}" alt="Test Logo" style="width: 200px; height: auto;">
    <p>If you see the logo above, base64 encoding is working correctly!</p>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync('test-logo-email.html', testHtml);
  console.log('\nTest HTML file created: test-logo-email.html');
  console.log('Open this file in your browser to verify the logo displays correctly.');
} else {
  console.error('Failed to generate base64 logo');
}