import { X, Plus, Minus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../../utils/getImageUrl'
import './Cart.css'

export default function CartDrawer() {
  const { cart, cartTotal, cartCount, cartOpen, setCartOpen, updateQty, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    setCartOpen(false)
    navigate('/checkout')
  }

  if (!cartOpen) return null

  return (
    <>
      <div className="cart-overlay animate-fade-in" onClick={() => setCartOpen(false)} />

      <div className="cart-drawer glass-strong animate-slide-in">

        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-row">
            <ShoppingCart size={20} />
            <h3>Your Cart</h3>
            {cartCount > 0 && <span className="badge">{cartCount} items</span>}
          </div>
          <button className="cart-close" onClick={() => setCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Your cart is empty</p>
              <span>Add some delicious items!</span>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((cartItem) => {
                const item = cartItem?.item
                if (!item || !item._id) return null

                return (
                  <div key={item._id} className="cart-item animate-fade-in">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name || 'Product'}
                      className="cart-item-img"
                      onError={e => {
                        e.target.onerror = null
                        e.target.src = 'https://placehold.co/60x60/1c1c1c/ff8c00?text=?'
                      }}
                    />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <span className="cart-item-price">₹{item.price} × {cartItem.quantity}</span>
                      <span className="cart-item-sub">= ₹{item.price * cartItem.quantity}</span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="qty-mini">
                        <button onClick={() => updateQty(item._id, cartItem.quantity - 1)}>
                          <Minus size={12} />
                        </button>
                        <span className="qty-value">{cartItem.quantity}</span>
                        <button onClick={() => updateQty(item._id, cartItem.quantity + 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span><span>₹{cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery fee</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span className="accent-text">₹{cartTotal}</span>
              </div>
            </div>
            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
              <span>Proceed to Pay</span>
              <ArrowRight size={18} />
            </button>
            <button className="clear-cart-btn" onClick={clearCart}>Clear cart</button>
          </div>
        )}
      </div>
    </>
  )
}