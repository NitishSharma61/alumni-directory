import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/constants'
import { sendWelcomeEmail } from '@/lib/email-service'

export async function POST(request) {
  try {
    // Get the request body
    const { alumniId, adminEmail } = await request.json()

    if (!alumniId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify admin email
    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update the alumni profile
    const { data, error } = await supabase
      .from('alumni_profiles')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: adminEmail
      })
      .eq('id', alumniId)
      .select()
      .single()

    if (error) {
      console.error('Error approving user:', error)
      return NextResponse.json(
        { error: 'Failed to approve user' },
        { status: 500 }
      )
    }

    // Send welcome email to the approved user
    if (data && data.email) {
      const emailResult = await sendWelcomeEmail({
        email: data.email,
        full_name: data.full_name,
        batch_start: data.batch_start,
        batch_end: data.batch_end
      })

      if (!emailResult.success) {
        console.error('Failed to send welcome email:', emailResult.error)
        // Don't fail the approval if email fails - just log it
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}