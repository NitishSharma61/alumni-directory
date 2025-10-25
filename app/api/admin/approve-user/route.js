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

    // Step 1: Fetch the pending user data
    const { data: pendingUser, error: fetchError } = await supabase
      .from('pending_approval')
      .select('*')
      .eq('id', alumniId)
      .single()

    if (fetchError || !pendingUser) {
      console.error('Error fetching pending user:', fetchError)
      return NextResponse.json(
        { error: 'Pending user not found' },
        { status: 404 }
      )
    }

    // Step 2: Insert into alumni_profiles
    const { data: approvedUser, error: insertError } = await supabase
      .from('alumni_profiles')
      .insert({
        user_id: pendingUser.user_id,
        full_name: pendingUser.full_name,
        email: pendingUser.email,
        phone: pendingUser.phone,
        roll_no: pendingUser.roll_no,
        batch_start: pendingUser.batch_start,
        batch_end: pendingUser.batch_end,
        bio: pendingUser.bio,
        photo_url: pendingUser.photo_url,
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: adminEmail,
        created_at: pendingUser.created_at,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting into alumni_profiles:', insertError)
      return NextResponse.json(
        { error: 'Failed to approve user' },
        { status: 500 }
      )
    }

    // Step 3: Delete from pending_approval
    const { error: deleteError } = await supabase
      .from('pending_approval')
      .delete()
      .eq('id', alumniId)

    if (deleteError) {
      console.error('Error deleting from pending_approval:', deleteError)
      // Don't fail the approval if deletion fails - user is already approved
    }

    // Step 4: Send welcome email via AWS SES
    if (approvedUser && approvedUser.email) {
      const emailResult = await sendWelcomeEmail({
        email: approvedUser.email,
        full_name: approvedUser.full_name,
        batch_start: approvedUser.batch_start,
        batch_end: approvedUser.batch_end
      })

      if (!emailResult.success) {
        console.error('Failed to send welcome email:', emailResult.error)
        // Don't fail the approval if email fails - just log it
      } else {
        console.log(`Welcome email sent to ${approvedUser.email}`)
      }
    }

    return NextResponse.json({ success: true, data: approvedUser })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}