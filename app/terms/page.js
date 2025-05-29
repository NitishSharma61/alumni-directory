import Link from 'next/link'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function TermsPage() {
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
              Terms & Conditions
            </h1>
            
            <div className="prose" style={{color: 'var(--foreground-secondary)', lineHeight: 1.7}}>
              <p className="text-sm mb-6" style={{color: 'var(--foreground-tertiary)'}}>
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing and using the Alumni Directory service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>2. Use License</h2>
                <p className="mb-4">
                  Permission is granted to temporarily access the materials (information or software) on Alumni Directory for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>modify or copy the materials;</li>
                  <li>use the materials for any commercial purpose or for any public display;</li>
                  <li>attempt to reverse engineer any software contained on Alumni Directory;</li>
                  <li>remove any copyright or other proprietary notations from the materials.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>3. Privacy Policy</h2>
                <p className="mb-4">
                  Your use of our Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>4. User Accounts</h2>
                <p className="mb-4">
                  When you create an account with us, you guarantee that the information you provide us is accurate, complete, and current at all times. You are responsible for maintaining the confidentiality of your account and password.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>5. Prohibited Uses</h2>
                <p className="mb-4">
                  You may not use Alumni Directory:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>For any unlawful purpose</li>
                  <li>To solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>6. Disclaimer</h2>
                <p className="mb-4">
                  The materials on Alumni Directory are provided &quot;as is&quot;. Alumni Directory makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>7. Limitations</h2>
                <p className="mb-4">
                  In no event shall Alumni Directory or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Alumni Directory, even if Alumni Directory or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>8. Modifications</h2>
                <p className="mb-4">
                  Alumni Directory may revise these terms of use for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms and Conditions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>9. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms & Conditions, please contact us at:
                </p>
                <div style={{background: 'var(--background-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius)', marginTop: '1rem'}}>
                  <p className="mb-2"><strong>Email:</strong> legal@alumnidirectory.org</p>
                  <p className="mb-2"><strong>Phone:</strong> +1 (234) 567-890</p>
                  <p><strong>Address:</strong> 123 University Avenue, Suite 100, City, State 12345</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}