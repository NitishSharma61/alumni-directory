// Use native fetch if available, otherwise will need to install node-fetch

async function testLogoUrl() {
  const logoUrl = process.env.EMAIL_LOGO_URL;
  
  if (!logoUrl) {
    console.error('❌ EMAIL_LOGO_URL is not set in environment variables');
    console.log('Please run the upload-logo script first and set the EMAIL_LOGO_URL');
    return;
  }
  
  console.log('Testing logo URL:', logoUrl);
  
  try {
    const response = await fetch(logoUrl);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log('✅ Logo URL is accessible!');
      console.log('Content-Type:', contentType);
      console.log('File size:', contentLength, 'bytes');
      
      // Test in email template context
      console.log('\n📧 Email template will use this URL for the logo');
      console.log('The logo will be embedded as: <img src="' + logoUrl + '" />');
      
    } else {
      console.error('❌ Logo URL returned error:', response.status, response.statusText);
      console.log('Please check if the bucket is public and the file exists');
    }
  } catch (error) {
    console.error('❌ Failed to fetch logo URL:', error.message);
    console.log('Please verify the URL is correct and accessible');
  }
}

testLogoUrl();