import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { token, action } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No reCAPTCHA token provided' },
        { status: 400 }
      )
    }

    // Verify the token with Google
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify'
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    })

    const data = await response.json()

    // Check if verification was successful
    if (!data.success) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA verification failed', errors: data['error-codes'] },
        { status: 400 }
      )
    }

    // Verify the action matches what we expect
    if (data.action !== action) {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      )
    }

    // Check the score (1.0 is very likely a good interaction, 0.0 is very likely a bot)
    const threshold = action === 'signup' ? 0.7 : 0.5 // Stricter for signup
    
    if (data.score < threshold) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Score too low', 
          score: data.score,
          threshold 
        },
        { status: 400 }
      )
    }

    // All checks passed
    return NextResponse.json({
      success: true,
      score: data.score,
      action: data.action,
    })

  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}