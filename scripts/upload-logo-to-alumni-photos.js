const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadLogoToAlumniPhotos() {
  try {
    console.log('Starting logo upload to alumni-photos bucket...');
    
    // Read the logo file
    const logoPath = path.join(__dirname, '..', 'public', 'logo-alumni.png');
    console.log('Reading logo from:', logoPath);
    
    if (!fs.existsSync(logoPath)) {
      console.error('Logo file not found at:', logoPath);
      return;
    }
    
    const logoFile = fs.readFileSync(logoPath);
    console.log('Logo file size:', logoFile.length, 'bytes');
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'alumni-photos');
    
    if (!bucketExists) {
      console.error('Bucket "alumni-photos" does not exist!');
      console.log('Available buckets:', buckets?.map(b => b.name).join(', '));
      return;
    }
    
    console.log('Found alumni-photos bucket');
    
    // Upload the logo to a special folder for email assets
    const filePath = 'email-assets/logo-alumni.png';
    
    const { data, error } = await supabase.storage
      .from('alumni-photos')
      .upload(filePath, logoFile, {
        contentType: 'image/png',
        upsert: true, // This will overwrite if file exists
        cacheControl: '3600' // Cache for 1 hour
      });
    
    if (error) {
      console.error('Error uploading logo:', error);
      return;
    }
    
    console.log('Logo uploaded successfully!');
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('alumni-photos')
      .getPublicUrl(filePath);
    
    console.log('\n✅ Success!');
    console.log('Public URL:', publicUrl);
    console.log('\n📝 Add this to your .env.local and production environment:');
    console.log(`EMAIL_LOGO_URL=${publicUrl}`);
    
    // Test if the URL is accessible
    console.log('\n🔍 Testing URL accessibility...');
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log('✅ URL is publicly accessible!');
      } else {
        console.log('⚠️  URL returned status:', response.status);
        console.log('You may need to make the bucket public in Supabase settings.');
      }
    } catch (fetchError) {
      console.log('⚠️  Could not test URL accessibility:', fetchError.message);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure you have set:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Run the upload
uploadLogoToAlumniPhotos();