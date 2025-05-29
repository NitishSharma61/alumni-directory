import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="simple-footer">
      <div className="modern-container">
        <div className="flex flex-col md:flex-row justify-between items-center" style={{padding: '1rem 0'}}>
          <p style={{color: 'var(--foreground-tertiary)', fontSize: '0.875rem'}}>
            © {currentYear} Alumni Directory. All rights reserved.
          </p>
          <div className="flex items-center" style={{gap: '1.5rem'}}>
            <Link href="/terms" className="footer-link">
              Terms & Conditions
            </Link>
            <span style={{color: 'var(--border)'}}>|</span>
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <span style={{color: 'var(--border)'}}>|</span>
            <a href="mailto:support@alumnidirectory.org" className="footer-link">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}