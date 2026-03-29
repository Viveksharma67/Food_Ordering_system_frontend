import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, Truck, ChefHat, XCircle, RefreshCw } from 'lucide-react'
import api from '../utils/api'
import './Orders.css'

const STATUS_CONFIG = {
  placed:           { label: 'Order Placed',       icon: Package,      color: '#5b9bd5', step: 1 },
  confirmed:        { label: 'Confirmed',           icon: CheckCircle,  color: '#ff8c00', step: 2 },
  preparing:        { label: 'Preparing',           icon: ChefHat,      color: '#a78bfa', step: 3 },
  out_for_delivery: { label: 'Out for Delivery',    icon: Truck,        color: '#fbbf24', step: 4 },
  delivered:        { label: 'Delivered',           icon: CheckCircle,  color: '#4caf7d', step: 5 },
}

const ALL_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders/my-orders')
      setOrders(res.data)
    } catch {}
    setLoading(false)
  }

  const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  if (loading) return (
    <div className="page-wrapper orders-page">
      <div className="container" style={{ paddingTop: 48 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton order-skeleton" style={{ marginBottom: 16 }} />)}
      </div>
    </div>
  )

  return (
    <div className="page-wrapper orders-page">
      <div className="container orders-container">
        <div className="orders-header">
          <h1 className="orders-title">My <span className="accent-text">Orders</span></h1>
          <button className="btn btn-ghost refresh-btn" onClick={fetchOrders}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty animate-fade-in">
            <span>🍽</span>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed
              const Icon = cfg.icon
              const isOpen = expanded === order._id
              const curStep = cfg.step

              return (
                <div
                  key={order._id}
                  className="order-card animate-fade-in"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* Card Header */}
                  <div className="order-card-header" onClick={() => setExpanded(isOpen ? null : order._id)}>
                    <div className="order-id-row">
                      <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">{fmt(order.createdAt)}</span>
                    </div>

                    <div className="order-meta-row">
                      <div className="order-status-chip" style={{ background: `${cfg.color}22`, borderColor: `${cfg.color}55`, color: cfg.color }}>
                        <Icon size={13} />
                        <span>{cfg.label}</span>
                      </div>
                      <span className="order-total accent-text">₹{order.totalAmount}</span>
                      <span className="expand-chevron">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="order-card-body animate-fade-in">
                      {/* Status Timeline */}
                      <div className="status-timeline">
                        {ALL_STEPS.map((step, i) => {
                          const sCfg = STATUS_CONFIG[step]
                          const SIcon = sCfg.icon
                          const isDone = curStep > sCfg.step
                          const isCur  = curStep === sCfg.step
                          return (
                            <div key={step} className={`timeline-step ${isDone ? 'done' : ''} ${isCur ? 'current' : ''}`}>
                              <div className="tl-icon-wrap" style={isCur || isDone ? { borderColor: sCfg.color, background: `${sCfg.color}22` } : {}}>
                                <SIcon size={14} style={{ color: isCur || isDone ? sCfg.color : 'var(--text-muted)' }} />
                              </div>
                              <span className="tl-label" style={isCur ? { color: sCfg.color, fontWeight: 700 } : {}}>{sCfg.label}</span>
                              {i < ALL_STEPS.length - 1 && (
                                <div className={`tl-line ${isDone ? 'done' : ''}`} />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Items list */}
                      <div className="order-items">
                        <h4 className="order-items-title">Items</h4>
                        {order.items.map((oi, i) => (
                          <div key={i} className="order-item-row">
                            <img
                              src={oi.image}
                              alt={oi.name}
                              onError={e => e.target.src = `https://via.placeholder.com/44x44/1c1c1c/ff8c00?text=?`}
                            />
                            <span className="oi-name">{oi.name}</span>
                            <span className="oi-qty">×{oi.quantity}</span>
                            <span className="oi-price accent-text">₹{oi.price * oi.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Address */}
                      {order.address && (
                        <div className="order-address">
                          <span className="addr-label">Delivery to:</span>
                          <span className="addr-val">{order.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
