export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background-secondary)'}}>
      <div className="text-center animate-fadeIn">
        <div className="loading-lg mx-auto mb-4"></div>
        <p className="text-lg" style={{color: 'var(--foreground)'}}>Loading...</p>
      </div>
    </div>
  )
}