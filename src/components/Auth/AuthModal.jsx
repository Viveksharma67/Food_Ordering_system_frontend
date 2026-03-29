import { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'otp'
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tempData, setTempData] = useState(null)
  const { login } = useAuth()
  const { fetchCart } = useCart()

  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' })
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password)
      return toast.error('All fields required')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { name: form.name, email: form.email, password: form.password })
      setTempData({ name: form.name, email: form.email, password: form.password })
      toast.success('OTP sent to your email!')
      setMode('otp')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending OTP')
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!form.otp) return toast.error('Enter the OTP')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { ...tempData, otp: form.otp })
      login(res.data.user, res.data.token)
      await fetchCart()
      toast.success(`Welcome, ${res.data.user.name}! 🎉`)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('All fields required')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password })
      login(res.data.user, res.data.token)
      await fetchCart()
      toast.success(`Welcome back, ${res.data.user.name}! 🔥`)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal glass-strong animate-scale-in">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        {/* Header */}
        <div className="auth-header">
          <span className="auth-logo">🌶</span>
          <h2 className="auth-title">
            {mode === 'login'  && 'Welcome Back'}
            {mode === 'signup' && 'Join SpiceLane'}
            {mode === 'otp'   && 'Verify Email'}
          </h2>
          <p className="auth-sub">
            {mode === 'login'  && 'Sign in to your account'}
            {mode === 'signup' && 'Create your free account'}
            {mode === 'otp'   && `OTP sent to ${tempData?.email}`}
          </p>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input className="input" type="email" placeholder="Email address"
                value={form.email} onChange={update('email')} />
            </div>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input className="input" type={showPass ? 'text' : 'password'}
                placeholder="Password" value={form.password} onChange={update('password')} />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
            <p className="auth-switch">
              Don't have an account?{' '}
              <button type="button" onClick={() => setMode('signup')}>Create one</button>
            </p>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input className="input" type="text" placeholder="Full name"
                value={form.name} onChange={update('name')} />
            </div>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input className="input" type="email" placeholder="Email address"
                value={form.email} onChange={update('email')} />
            </div>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input className="input" type={showPass ? 'text' : 'password'}
                placeholder="Create password" value={form.password} onChange={update('password')} />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
            </button>
            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')}>Sign in</button>
            </p>
          </form>
        )}

        {/* OTP Form */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="otp-info">
              <div className="otp-icon-wrap"><KeyRound size={22} /></div>
              <p>Enter the 6-digit code we sent to your email. Valid for 5 minutes.</p>
            </div>
            <div className="input-group">
              <KeyRound size={16} className="input-icon" />
              <input className="input otp-input" type="text" placeholder="• • • • • •"
                value={form.otp} onChange={update('otp')} maxLength={6} />
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : <><span>Verify & Register</span><ArrowRight size={16} /></>}
            </button>
            <p className="auth-switch">
              Wrong email?{' '}
              <button type="button" onClick={() => setMode('signup')}>Go back</button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
