import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadLogo() {
  try {
    // Read the logo file
    const logoPath = path.join(process.cwd(), 'public', 'logo-alumni.png');
    const logoFile = fs.readFileSync(logoPath);
    
    // Create the bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'email-assets');
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('email-assets', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      console.log('Created email-assets bucket');
    }
    
    // Upload the logo
    const { data, error } = await supabase.storage
      .from('email-assets')
      .upload('logo-alumni.png', logoFile, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading logo:', error);
      return;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('email-assets')
      .getPublicUrl('logo-alumni.png');
    
    console.log('Logo uploaded successfully!');
    console.log('Public URL:', publicUrl);
    console.log('\nAdd this to your .env.local:');
    console.log(`EMAIL_LOGO_URL=${publicUrl}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the upload
uploadLogo();