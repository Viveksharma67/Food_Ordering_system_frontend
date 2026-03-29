import { useState } from 'react'
import { Plus, Minus, MessageSquare, Send, ShoppingCart, ChevronDown } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { getImageUrl } from '../../utils/getImageUrl'
import './ItemCard.css'

export default function ItemCard({ item, onAuthRequired }) {
  const [commentOpen, setCommentOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(item.comments || [])
  const [submitting, setSubmitting] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const { addToCart, updateQty, cart } = useCart()
  const { isLoggedIn } = useAuth()

  const cartItem = cart.find(c => c.item?._id === item._id || c.item === item._id)
  const qty = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    if (!isLoggedIn) { onAuthRequired(); return }
    setAddingToCart(true)
    try {
      await addToCart(item._id)
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add')
    }
    setAddingToCart(false)
  }

  const handleQtyChange = async (newQty) => {
    if (!isLoggedIn) return
    try { await updateQty(item._id, newQty) } catch {}
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { onAuthRequired(); return }
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post(`/items/${item._id}/comment`, { text: commentText })
      setComments(res.data.comments)
      setCommentText('')
      toast.success('Comment posted!')
    } catch {
      toast.error('Failed to post comment')
    }
    setSubmitting(false)
  }

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#ffc107' : 'var(--text-muted)' }}>★</span>
    ))

  return (
    <div className="item-card animate-fade-in">
      {/* Image */}
      <div className="item-img-wrap">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="item-img"
          onError={e => {
            e.target.onerror = null
            e.target.src = `https://placehold.co/400x260/1c1c1c/ff8c00?text=${encodeURIComponent(item.name)}`
          }}
        />
        <div className="item-img-overlay" />
        <div className="veg-badge">
          <span className="veg-dot" />
          <span>VEG</span>
        </div>
        {item.category?.name && (
          <div className="category-chip">{item.category.name}</div>
        )}
      </div>

      {/* Content */}
      <div className="item-body">
        <div className="item-top-row">
          <h3 className="item-name">{item.name}</h3>
          <div className="item-rating">
            <span className="stars">{renderStars(item.rating)}</span>
            <span className="rating-val">{Number(item.rating).toFixed(1)}</span>
          </div>
        </div>

        <p className="item-desc">{item.description}</p>

        <div className="item-footer">
          <div className="item-price">
            <span className="price-sym">₹</span>
            <span className="price-val">{item.price}</span>
          </div>

          {qty === 0 ? (
            <button
              className={`btn-add-cart ${addingToCart ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart
                ? <span className="spinner-sm" />
                : <><ShoppingCart size={15} /><span>Add</span><Plus size={13} /></>
              }
            </button>
          ) : (
            <div className="qty-control">
              <button onClick={() => handleQtyChange(qty - 1)}><Minus size={14} /></button>
              <span className="qty-val">{qty}</span>
              <button onClick={() => handleQtyChange(qty + 1)}><Plus size={14} /></button>
            </div>
          )}
        </div>

        {/* Comment Toggle */}
        <button
          className={`comment-toggle ${commentOpen ? 'open' : ''}`}
          onClick={() => setCommentOpen(o => !o)}
        >
          <MessageSquare size={14} />
          <span>{comments.length} {comments.length === 1 ? 'review' : 'reviews'}</span>
          <ChevronDown size={14} className="chevron" />
        </button>

        {/* Comment Section */}
        {commentOpen && (
          <div className="comment-section animate-fade-in">
            {comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((c, i) => (
                  <div key={i} className="comment-item">
                    <div className="comment-avatar">
                      {(c.name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <span className="comment-author">{c.name || 'User'}</span>
                      <p className="comment-text">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-comments">No reviews yet. Be the first!</p>
            )}

            <form onSubmit={handleComment} className="comment-form">
              <input
                type="text"
                className="input comment-input"
                placeholder={isLoggedIn ? "Share your experience..." : "Login to comment"}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={!isLoggedIn}
                onClick={() => !isLoggedIn && onAuthRequired()}
              />
              <button
                type="submit"
                className="comment-send"
                disabled={submitting || !isLoggedIn || !commentText.trim()}
              >
                {submitting ? <span className="spinner-sm" /> : <Send size={15} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}