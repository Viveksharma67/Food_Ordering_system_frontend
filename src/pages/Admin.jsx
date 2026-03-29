import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Edit2, Check, X, Package, Grid, ShoppingBag, Upload, RefreshCw } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { getImageUrl } from '../utils/getImageUrl'
import './Admin.css'

const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
const STATUS_LABELS  = { placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' }
const STATUS_COLORS  = { placed: '#5b9bd5', confirmed: '#ff8c00', preparing: '#a78bfa', out_for_delivery: '#fbbf24', delivered: '#4caf7d' }

export default function Admin() {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders]         = useState([])
  const [ordersLoading, setOL]      = useState(false)
  const [items, setItems]           = useState([])
  const [categories, setCategories] = useState([])
  const [itemForm, setItemForm]     = useState({ name: '', description: '', price: '', rating: '4', category: '' })
  const [itemImg, setItemImg]       = useState(null)
  const [itemImgPrev, setImgPrev]   = useState('')
  const [editItem, setEditItem]     = useState(null)
  const [savingItem, setSavingItem] = useState(false)
  const itemFileRef = useRef()
  const [catForm, setCatForm]       = useState({ name: '', description: '' })
  const [catImg, setCatImg]         = useState(null)
  const [savingCat, setSavingCat]   = useState(false)
  const catFileRef = useRef()

  useEffect(() => { fetchOrders(); fetchItems(); fetchCategories() }, [])

  const fetchOrders = async () => {
    setOL(true)
    try { const r = await api.get('/admin/orders'); setOrders(r.data) } catch {}
    setOL(false)
  }
  const fetchItems = async () => {
    try { const r = await api.get('/items'); setItems(r.data) } catch {}
  }
  const fetchCategories = async () => {
    try { const r = await api.get('/items/categories'); setCategories(r.data) } catch {}
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status })
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o))
      toast.success('Status updated!')
    } catch { toast.error('Failed') }
  }

  const handleItemImgChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setItemImg(f)
    setImgPrev(URL.createObjectURL(f))
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!itemForm.name || !itemForm.price || !itemForm.category)
      return toast.error('Fill all required fields')
    setSavingItem(true)
    try {
      const fd = new FormData()
      Object.entries(itemForm).forEach(([k, v]) => fd.append(k, v))
      if (itemImg) fd.append('image', itemImg)
      if (editItem) {
        await api.put(`/admin/items/${editItem._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Item updated!')
        setEditItem(null)
      } else {
        if (!itemImg) { toast.error('Image required'); setSavingItem(false); return }
        await api.post('/admin/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Item added!')
      }
      setItemForm({ name: '', description: '', price: '', rating: '4', category: '' })
      setItemImg(null); setImgPrev('')
      fetchItems()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    setSavingItem(false)
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this item?')) return
    try { await api.delete(`/admin/items/${id}`); fetchItems(); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const startEditItem = (item) => {
    setEditItem(item)
    setItemForm({ name: item.name, description: item.description, price: item.price, rating: item.rating, category: item.category?._id || '' })
    setImgPrev(getImageUrl(item.image))  // ✅ getImageUrl use karo
    document.getElementById('item-form-top')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!catForm.name) return toast.error('Category name required')
    setSavingCat(true)
    try {
      const fd = new FormData()
      Object.entries(catForm).forEach(([k, v]) => fd.append(k, v))
      if (catImg) fd.append('image', catImg)
      await api.post('/admin/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Category added!')
      setCatForm({ name: '', description: '' }); setCatImg(null)
      fetchCategories()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    setSavingCat(false)
  }

  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this category?')) return
    try { await api.delete(`/admin/categories/${id}`); fetchCategories(); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="page-wrapper admin-page">
      <div className="container admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Admin <span className="accent-text">Panel</span></h1>
        </div>

        <div className="admin-tabs">
          {[
            { id: 'orders',     label: 'Orders',     icon: ShoppingBag },
            { id: 'items',      label: 'Menu Items',  icon: Package },
            { id: 'categories', label: 'Categories',  icon: Grid },
          ].map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <Icon size={16} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="admin-section animate-fade-in">
            <div className="section-top-row">
              <h2 className="admin-section-title">All Orders <span className="badge">{orders.length}</span></h2>
              <button className="btn btn-ghost" onClick={fetchOrders}><RefreshCw size={14} /></button>
            </div>
            {ordersLoading ? (
              <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 14 }} />)}</div>
            ) : orders.length === 0 ? (
              <p className="empty-msg">No orders yet.</p>
            ) : (
              <div className="admin-orders-list">
                {orders.map(order => {
                  const color = STATUS_COLORS[order.orderStatus]
                  return (
                    <div key={order._id} className="admin-order-card">
                      <div className="aoc-left">
                        <span className="aoc-id">#{order._id.slice(-8).toUpperCase()}</span>
                        <span className="aoc-user">{order.user?.name} — {order.user?.email}</span>
                        <span className="aoc-items">{order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</span>
                        <span className="aoc-addr">{order.address}</span>
                      </div>
                      <div className="aoc-right">
                        <span className="aoc-amount accent-text">₹{order.totalAmount}</span>
                        <div className="status-select-wrap">
                          <select
                            className="status-select"
                            value={order.orderStatus}
                            onChange={e => updateOrderStatus(order._id, e.target.value)}
                            style={{ borderColor: color + '66', color }}
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ITEMS */}
        {tab === 'items' && (
          <div className="admin-section animate-fade-in">
            <div id="item-form-top" className="admin-form-card glass">
              <h3 className="form-title">{editItem ? '✏️ Edit Item' : '➕ Add New Item'}</h3>
              <form onSubmit={handleAddItem} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input className="input" value={itemForm.name}
                      onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paneer Tikka" />
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input className="input" type="number" value={itemForm.price}
                      onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 180" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="input" rows={2} value={itemForm.description}
                    onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select className="input" value={itemForm.category}
                      onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rating (1–5)</label>
                    <input className="input" type="number" min="1" max="5" step="0.1" value={itemForm.rating}
                      onChange={e => setItemForm(f => ({ ...f, rating: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image {!editItem && '*'}</label>
                  <div className="img-upload-wrap" onClick={() => itemFileRef.current.click()}>
                    {itemImgPrev
                      ? <img src={itemImgPrev} alt="preview" className="img-preview" />
                      : <div className="img-placeholder"><Upload size={24} /><span>Click to upload</span></div>
                    }
                  </div>
                  <input ref={itemFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleItemImgChange} />
                </div>

                <div className="form-actions">
                  {editItem && (
                    <button type="button" className="btn btn-ghost" onClick={() => {
                      setEditItem(null)
                      setItemForm({ name: '', description: '', price: '', rating: '4', category: '' })
                      setImgPrev('')
                    }}>
                      <X size={15} /> Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={savingItem}>
                    {savingItem ? <span className="spinner" /> : <><Check size={15} /> {editItem ? 'Update Item' : 'Add Item'}</>}
                  </button>
                </div>
              </form>
            </div>

            <h3 className="admin-section-title" style={{ marginTop: 28 }}>
              All Items <span className="badge">{items.length}</span>
            </h3>
            <div className="admin-items-grid">
              {items.map(item => (
                <div key={item._id} className="admin-item-card">
                  {/* ✅ getImageUrl use kiya */}
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    onError={e => {
                      e.target.onerror = null
                      e.target.src = 'https://placehold.co/80x80/1c1c1c/ff8c00?text=?'
                    }}
                  />
                  <div className="aic-info">
                    <span className="aic-name">{item.name}</span>
                    <span className="aic-cat">{item.category?.name}</span>
                    <span className="aic-price accent-text">₹{item.price}</span>
                  </div>
                  <div className="aic-actions">
                    <button className="icon-btn edit" onClick={() => startEditItem(item)}><Edit2 size={14} /></button>
                    <button className="icon-btn del" onClick={() => handleDeleteItem(item._id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <div className="admin-section animate-fade-in">
            <div className="admin-form-card glass">
              <h3 className="form-title">➕ Add Category</h3>
              <form onSubmit={handleAddCategory} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input className="input" value={catForm.name}
                      onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Starters" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input className="input" value={catForm.description}
                      onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image (optional)</label>
                  <div className="img-upload-wrap small" onClick={() => catFileRef.current.click()}>
                    {catImg
                      ? <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>✓ {catImg.name}</span>
                      : <div className="img-placeholder"><Upload size={18} /><span>Upload icon</span></div>
                    }
                  </div>
                  <input ref={catFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => setCatImg(e.target.files[0])} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingCat}>
                  {savingCat ? <span className="spinner" /> : <><Plus size={15} /> Add Category</>}
                </button>
              </form>
            </div>

            <h3 className="admin-section-title" style={{ marginTop: 28 }}>
              All Categories <span className="badge">{categories.length}</span>
            </h3>
            <div className="cats-grid">
              {categories.map(cat => (
                <div key={cat._id} className="cat-admin-card">
                  {/* ✅ getImageUrl use kiya */}
                  {cat.image && (
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      onError={e => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="cac-info">
                    <span className="cac-name">{cat.name}</span>
                    <span className="cac-desc">{cat.description}</span>
                  </div>
                  <button className="icon-btn del" onClick={() => handleDeleteCat(cat._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}