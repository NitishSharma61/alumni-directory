import fs from 'fs';
import path from 'path';

// Function to get logo as base64
export function getLogoBase64() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-alumni.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const base64Logo = logoBuffer.toString('base64');
    return `data:image/png;base64,${base64Logo}`;
  } catch (error) {
    console.error('Error reading logo file:', error);
    return null;
  }
}

// Cache the base64 logo to avoid reading file multiple times
let cachedLogoBase64 = null;

export function getCachedLogoBase64() {
  if (!cachedLogoBase64) {
    cachedLogoBase64 = getLogoBase64();
  }
  return cachedLogoBase64;
}