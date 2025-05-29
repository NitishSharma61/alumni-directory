export function middleware(request) {
  // Let the request pass through - no custom logic needed
  // This file ensures manifest.json and other static assets are accessible
}

export const config = {
  // Exclude the following paths from middleware processing
  // This allows these files to be served without authentication on Vercel preview deployments
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - manifest.json (PWA manifest)
     * - icon-*.png (PWA icons)
     * - sw.js (Service Worker)
     * - workbox-*.js (Workbox runtime)
     * - favicon.ico
     * - _next/static (static files)
     * - _next/image (optimized images)
     * - api (API routes)
     */
    '/((?!manifest\.json|icon-.*\.png|sw\.js|workbox-.*\.js|favicon\.ico|_next/static|_next/image|api).*)',
  ],
}