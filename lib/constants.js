// Admin email addresses - these users have admin privileges
export const ADMIN_EMAILS = [
  'sharmanitish6116@gmail.com',
  'reachnishantsharma@gmail.com'
]

// Check if a user email is an admin
export const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase())
}