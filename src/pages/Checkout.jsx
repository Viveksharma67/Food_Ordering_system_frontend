import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Wallet, ArrowRight, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import './Checkout.css'

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [payMethod, setPayMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (cart.length === 0 && !done) {
    navigate('/')
    return null
  }

  const handleOrder = async () => {
    if (!address.trim()) return toast.error('Please enter delivery address')
    setLoading(true)
    try {
      await api.post('/orders/place', { address })
      await clearCart()
      setDone(true)
      setTimeout(() => navigate('/orders'), 2800)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed')
    }
    setLoading(false)
  }

  if (done) return (
    <div className="page-wrapper checkout-page">
      <div className="order-success animate-scale-in">
        <div className="success-ring">
          <CheckCircle size={52} />
        </div>
        <h2>Order Placed! 🎉</h2>
        <p>Your food is being prepared. Redirecting to orders...</p>
        <div className="success-loader" />
      </div>
    </div>
  )

  return (
    <div className="page-wrapper checkout-page">
      <div className="container checkout-container">
        <div className="checkout-header">
          <h1 className="checkout-title">
            <span className="accent-text">Checkout</span>
          </h1>
          <p className="checkout-sub">Review your order and pay</p>
        </div>

        <div className="checkout-grid">
          {/* Left — Order summary */}
          <div className="checkout-summary">
            <h3 className="checkout-section-title">Order Summary</h3>
            <div className="checkout-items">
              {cart.map(c => {
                const item = c.item
                if (!item) return null
                return (
                  <div key={item._id} className="co-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={e => e.target.src = `https://via.placeholder.com/56x56/1c1c1c/ff8c00?text=?`}
                    />
                    <div className="co-item-info">
                      <span className="co-item-name">{item.name}</span>
                      <span className="co-item-qty">Qty: {c.quantity}</span>
                    </div>
                    <span className="co-item-price accent-text">₹{item.price * c.quantity}</span>
                  </div>
                )
              })}
            </div>
            <div className="co-total-box">
              <div className="co-row"><span>Subtotal</span><span>₹{cartTotal}</span></div>
              <div className="co-row"><span>Delivery</span><span style={{ color: 'var(--success)' }}>FREE</span></div>
              <div className="co-row co-grand"><span>Grand Total</span><span className="accent-text">₹{cartTotal}</span></div>
            </div>
          </div>

          {/* Right — Delivery & Payment */}
          <div className="checkout-form-col">
            {/* Address */}
            <div className="checkout-card glass">
              <div className="checkout-card-title">
                <MapPin size={18} className="accent-text" />
                <h3>Delivery Address</h3>
              </div>
              <textarea
                className="input address-input"
                placeholder="Enter your full delivery address..."
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* Payment */}
            <div className="checkout-card glass">
              <div className="checkout-card-title">
                <CreditCard size={18} className="accent-text" />
                <h3>Payment Method</h3>
              </div>
              <div className="pay-options">
                {[
                  { id: 'cod',    label: 'Cash on Delivery', icon: '💵' },
                  { id: 'upi',    label: 'UPI / QR',          icon: '📱' },
                  { id: 'card',   label: 'Debit / Credit Card', icon: '💳' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    className={`pay-option ${payMethod === opt.id ? 'active' : ''}`}
                    onClick={() => setPayMethod(opt.id)}
                  >
                    <span className="pay-icon">{opt.icon}</span>
                    <span>{opt.label}</span>
                    <span className="pay-radio" />
                  </button>
                ))}
              </div>
              {payMethod === 'upi' && (
                <div className="upi-hint animate-fade-in">
                  <p>UPI ID: <strong>spicelane@okaxis</strong></p>
                  <p className="hint-sub">Pay & confirm your order</p>
                </div>
              )}
              {payMethod === 'card' && (
                <div className="card-hint animate-fade-in">
                  <input className="input" placeholder="Card number" style={{ marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="MM/YY" />
                    <input className="input" placeholder="CVV" />
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary place-order-btn"
              onClick={handleOrder}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" /> Processing...</>
                : <><span>Place Order · ₹{cartTotal}</span><ArrowRight size={18} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
