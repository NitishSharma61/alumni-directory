import Link from 'next/link'
import Header from '@/components/Header'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{background: 'var(--background-secondary)'}}>
      {/* Header */}
      <Header />
      
      {/* Back Navigation */}
      <div className="modern-container" style={{paddingTop: '1rem'}}>
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm md:text-base transition-colors duration-200"
          style={{color: 'var(--foreground-secondary)'}}
        >
          <svg className="w-5 h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Content */}
      <div className="modern-container" style={{paddingTop: '3rem', paddingBottom: '4rem'}}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-fadeIn" style={{background: 'white', borderRadius: 'var(--radius-lg)', padding: '3rem', boxShadow: 'var(--shadow-sm)'}}>
            <h1 className="text-4xl font-bold mb-8" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>
              Privacy Policy
            </h1>
            
            <div className="prose" style={{color: 'var(--foreground-secondary)', lineHeight: 1.7}}>
              <p className="text-sm mb-6" style={{color: 'var(--foreground-tertiary)'}}>
                Effective Date: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>1. Introduction</h2>
                <p className="mb-4">
                  Alumni Directory (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our alumni directory service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>2. Information We Collect</h2>
                <h3 className="text-xl font-medium mb-3" style={{color: 'var(--foreground)'}}>Personal Information</h3>
                <p className="mb-4">
                  We collect information you provide directly to us, such as:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Batch/graduation years</li>
                  <li>Current job/position</li>
                  <li>Location (city, state)</li>
                  <li>Profile photo</li>
                </ul>

                <h3 className="text-xl font-medium mb-3" style={{color: 'var(--foreground)'}}>Automatically Collected Information</h3>
                <p className="mb-4">
                  When you use our service, we may automatically collect:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Log and usage data</li>
                  <li>Device information</li>
                  <li>IP address</li>
                  <li>Browser type and version</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>3. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Create and manage your alumni profile</li>
                  <li>Connect you with other alumni</li>
                  <li>Send you updates about alumni events and news</li>
                  <li>Improve our services</li>
                  <li>Comply with legal obligations</li>
                  <li>Protect against fraudulent or illegal activity</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>4. Information Sharing</h2>
                <p className="mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>With other alumni members (as per your privacy settings)</li>
                  <li>With service providers who assist in operating our platform</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>5. Data Security</h2>
                <p className="mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>6. Your Rights</h2>
                <p className="mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Access your personal information</li>
                  <li>Update or correct your information</li>
                  <li>Delete your account and information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>7. Cookies</h2>
                <p className="mb-4">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>8. Children&apos;s Privacy</h2>
                <p className="mb-4">
                  Our service is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children under 18.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>9. Changes to This Policy</h2>
                <p className="mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Effective Date.&quot;
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>10. Contact Us</h2>
                <p className="mb-4">
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <div style={{background: 'var(--background-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius)', marginTop: '1rem'}}>
                  <p className="mb-2"><strong>Email:</strong> privacy@alumnidirectory.org</p>
                  <p className="mb-2"><strong>Phone:</strong> +1 (234) 567-890</p>
                  <p><strong>Address:</strong> 123 University Avenue, Suite 100, City, State 12345</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}