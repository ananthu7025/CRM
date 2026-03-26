'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  // Guard against open redirect — only allow internal paths
  const rawFrom = params.get('from') ?? '/'
  const from = rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/'

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (res.ok) {
      setStep('otp')
      setResendTimer(30)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to send OTP')
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 5) inputRefs.current[i + 1]?.focus()
    if (next.every(d => d !== '')) verifyOtp(next.join(''))
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      verifyOtp(pasted)
    }
  }

  const verifyOtp = async (code: string) => {
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    setLoading(false)
    if (res.ok) {
      router.push(from)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Verification failed')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }

  const resend = async () => {
    setError('')
    setOtp(['', '', '', '', '', ''])
    setLoading(true)
    await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setResendTimer(30)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[#FF5E8D] font-bold text-2xl tracking-tight">LuminousTracker</span>
          <p className="text-sm text-[#94A3B8] mt-1">Internal Management Tool</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm">
          {step === 'email' ? (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5E8D]/10 mb-5 mx-auto">
                <Mail size={22} className="text-[#FF5E8D]" />
              </div>
              <h1 className="text-xl font-bold text-[#0F172A] text-center mb-1">Sign in</h1>
              <p className="text-sm text-[#94A3B8] text-center mb-6">
                Enter your admin email to receive a one-time code
              </p>

              <form onSubmit={requestOtp} className="space-y-4">
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all"
                  placeholder="admin@yourcompany.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending…' : <><span>Send OTP</span><ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5E8D]/10 mb-5 mx-auto">
                <ShieldCheck size={22} className="text-[#FF5E8D]" />
              </div>
              <h1 className="text-xl font-bold text-[#0F172A] text-center mb-1">Enter OTP</h1>
              <p className="text-sm text-[#94A3B8] text-center mb-1">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-medium text-[#0F172A] text-center mb-6">{email}</p>

              {/* OTP input boxes */}
              <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all ${
                      digit ? 'border-[#FF5E8D] bg-[#FF5E8D]/5 text-[#FF5E8D]' : 'border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  />
                ))}
              </div>

              {loading && (
                <p className="text-center text-xs text-[#94A3B8] mb-3">Verifying…</p>
              )}

              {error && (
                <p className="text-center text-xs text-red-500 mb-3">{error}</p>
              )}

              <div className="flex items-center justify-between text-xs mt-4">
                <button
                  onClick={() => { setStep('email'); setError(''); setOtp(['','','','','','']) }}
                  className="text-[#94A3B8] hover:text-[#475569] transition-colors"
                >
                  ← Change email
                </button>
                <button
                  onClick={resend}
                  disabled={resendTimer > 0 || loading}
                  className="flex items-center gap-1 text-[#FF5E8D] disabled:text-[#94A3B8] hover:underline disabled:no-underline transition-colors"
                >
                  <RotateCcw size={11} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-6">
          Single-user access · LuminousTracker v1.0
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
