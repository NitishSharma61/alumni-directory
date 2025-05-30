'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    
    // Simulate sending email
    setTimeout(() => {
      setSending(false)
      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    }, 1500)
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{gap: '3rem'}}>
            {/* Contact Information */}
            <div className="animate-fadeIn">
              <h1 className="text-4xl font-bold mb-6" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>
                Get in Touch
              </h1>
              <p className="text-lg mb-8" style={{color: 'var(--foreground-secondary)', lineHeight: 1.7}}>
                Have questions about the Alumni Directory? Need help with your account? We&apos;re here to help!
              </p>

              <div className="space-y-6">
                <div className="flex items-start" style={{gap: '1rem'}}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background: 'var(--primary-light)'}}>
                      <svg className="w-6 h-6" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{color: 'var(--foreground)'}}>Email Us</h3>
                    <p style={{color: 'var(--foreground-secondary)'}}>support@alumnidirectory.org</p>
                    <p className="text-sm mt-1" style={{color: 'var(--foreground-tertiary)'}}>We&apos;ll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start" style={{gap: '1rem'}}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background: 'var(--primary-light)'}}>
                      <svg className="w-6 h-6" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{color: 'var(--foreground)'}}>Call Us</h3>
                    <p style={{color: 'var(--foreground-secondary)'}}>+1 (234) 567-890</p>
                    <p className="text-sm mt-1" style={{color: 'var(--foreground-tertiary)'}}>Mon-Fri 9AM-5PM EST</p>
                  </div>
                </div>

                <div className="flex items-start" style={{gap: '1rem'}}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background: 'var(--primary-light)'}}>
                      <svg className="w-6 h-6" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{color: 'var(--foreground)'}}>Visit Us</h3>
                    <p style={{color: 'var(--foreground-secondary)'}}>123 University Avenue, Suite 100</p>
                    <p style={{color: 'var(--foreground-secondary)'}}>City, State 12345</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 rounded-lg" style={{background: 'var(--background-tertiary)'}}>
                <h3 className="font-semibold mb-3" style={{color: 'var(--foreground)'}}>Office Hours</h3>
                <div className="space-y-2" style={{color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>
                  <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                  <p>Saturday: 10:00 AM - 2:00 PM EST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-fadeIn" style={{background: 'white', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)'}}>
              <h2 className="text-2xl font-semibold mb-6" style={{color: 'var(--foreground)'}}>Send us a Message</h2>
              
              {success && (
                <div className="mb-6 p-4 rounded-lg" style={{background: 'rgba(0, 200, 150, 0.1)', border: '1px solid rgba(0, 200, 150, 0.3)'}}>
                  <p className="text-center" style={{color: 'var(--success)'}}>
                    Thank you for your message! We&apos;ll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="input"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="input"
                    placeholder="Tell us more about your inquiry..."
                    style={{resize: 'vertical'}}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="flex items-center justify-center">
                      <div className="loading mr-3"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}