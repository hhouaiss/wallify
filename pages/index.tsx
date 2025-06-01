import { useRouter } from 'next/router'
import React from 'react'

/**
 * Login screen component that serves as the home page
 * Features email and Google login buttons that redirect to welcome page
 */
export default function LoginScreen(): React.ReactElement {
  const router = useRouter()

  /**
   * Handle email login button press
   * Redirects directly to welcome page without actual authentication
   */
  const handleEmailLogin = (): void => {
    router.push('/welcome')
  }

  /**
   * Handle Google login button press
   * Redirects directly to welcome page without actual authentication
   */
  const handleGoogleLogin = (): void => {
    router.push('/welcome')
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Floating Elements for Visual Appeal */}
      <div className="floating-element w-32 h-32 top-20 left-10 opacity-30" />
      <div className="floating-element w-24 h-24 top-40 right-20 opacity-20" style={{ animationDelay: '2s' }} />
      <div className="floating-element w-40 h-40 bottom-32 left-1/4 opacity-25" style={{ animationDelay: '4s' }} />
      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <span className="text-4xl">📱</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Wallify
          </h1>
          <p className="text-gray-300 text-lg max-w-sm mx-auto leading-relaxed">
            Create Beautiful Lock Screen Wallpapers
          </p>
        </div>

        {/* Login Buttons Section */}
        <div className="w-full max-w-sm space-y-4">
          {/* Email Login Button */}
          <button
            onClick={handleEmailLogin}
            className="w-full glass-effect rounded-2xl p-4 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-xl p-4 flex items-center justify-center space-x-3">
              <span className="text-2xl">✉️</span>
              <span className="text-white font-semibold text-lg">Continue with Email</span>
            </div>
          </button>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full glass-effect rounded-2xl p-4 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 flex items-center justify-center space-x-3">
              <span className="text-2xl">🔍</span>
              <span className="text-white font-semibold text-lg">Continue with Google</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Transform your daily tasks into beautiful wallpapers
          </p>
        </div>
      </div>
    </div>
  )
}