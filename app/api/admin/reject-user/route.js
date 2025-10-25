import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/constants'

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

    // Step 1: Fetch the pending user to get user_id
    const { data: pendingUser, error: fetchError } = await supabase
      .from('pending_approval')
      .select('user_id')
      .eq('id', alumniId)
      .single()

    if (fetchError || !pendingUser) {
      console.error('Error fetching pending user:', fetchError)
      return NextResponse.json(
        { error: 'Pending user not found' },
        { status: 404 }
      )
    }

    // Step 2: Delete from pending_approval table
    const { error: deleteError } = await supabase
      .from('pending_approval')
      .delete()
      .eq('id', alumniId)

    if (deleteError) {
      console.error('Error deleting from pending_approval:', deleteError)
      return NextResponse.json(
        { error: 'Failed to reject user' },
        { status: 500 }
      )
    }

    // Step 3: Delete the auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      pendingUser.user_id
    )

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      // Don't fail the rejection if auth deletion fails - user is already removed from pending
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}