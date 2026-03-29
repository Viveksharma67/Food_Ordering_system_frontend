import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Flame } from 'lucide-react'
import ItemCard from '../components/ItemCard/ItemCard'
import api from '../utils/api'
import './Home.css'

const SLIDES = [
  { image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80', line1: 'Taste the',  line2: 'Extraordinary' },
  { image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80', line1: 'Fresh &',   line2: 'Delicious' },
  { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=80', line1: 'Pure Veg,', line2: 'Pure Love' },
  { image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1600&q=80', line1: 'Order with',line2: 'One Click' },
  { image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80', line1: 'Hot Food,', line2: 'Fast Delivery' },
]

export default function Home({ onAuthRequired }) {
  const [categories, setCategories]       = useState([])
  const [items, setItems]                 = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]               = useState('')
  const [loading, setLoading]             = useState(true)

  // Slider — ref based to avoid stale closures
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState(null)
  const currentRef  = useRef(0)       // always has latest current
  const animRef     = useRef(false)   // animating flag
  const timerRef    = useRef(null)

  useEffect(() => { fetchCategories(); fetchItems() }, [])
  useEffect(() => { fetchItems(activeCategory) }, [activeCategory])

  // Start auto timer on mount
  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [])

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % SLIDES.length
      slideTo(next)
    }, 6000)
  }

  const slideTo = (next) => {
    if (animRef.current) return
    if (next === currentRef.current) return

    animRef.current = true
    const prevIndex = currentRef.current

    setPrev(prevIndex)
    setCurrent(next)
    currentRef.current = next

    setTimeout(() => {
      setPrev(null)
      animRef.current = false
    }, 1100)
  }

  const goTo = (i) => {
    slideTo(i)
    startTimer() // restart timer on manual click
  }

  const fetchCategories = async () => {
    try { const res = await api.get('/items/categories'); setCategories(res.data) } catch {}
  }

  const fetchItems = async (category = 'all') => {
    setLoading(true)
    try {
      const url = category === 'all' ? '/items' : `/items?category=${category}`
      const res = await api.get(url)
      setItems(res.data)
    } catch {}
    setLoading(false)
  }

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  )

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="home">
      <section className="hero">

        {/* Background layers */}
        <div className="hero-bg-stack">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`hero-bg-layer ${i === current ? 'layer-current' : ''} ${i === prev ? 'layer-prev' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>

        <div className="hero-overlay" />

        {/* Content layers */}
        <div className="hero-content-stack">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`hero-content-layer ${i === current ? 'content-current' : ''} ${i === prev ? 'content-prev' : ''}`}
            >
              <div className="container">
                <div className="hero-inner">
                  <div className="hero-tag">
                    <Flame size={13} />
                    <span>100% Pure Vegetarian</span>
                  </div>
                  <h1 className="hero-title">
                    <span className="hero-line1">{slide.line1}</span>
                    <span className="hero-line2">{slide.line2}</span>
                  </h1>
                  <p className="hero-sub">
                    Freshly cooked meals delivered to your door — fast, hot & flavorful.
                  </p>
                  <div className="hero-actions">
                    <button className="btn btn-primary hero-btn" onClick={scrollToMenu}>
                      Explore Menu
                    </button>
                    <div className="hero-stats">
                      <div className="stat"><span className="stat-val">50+</span><span className="stat-label">Dishes</span></div>
                      <div className="stat-divider" />
                      <div className="stat"><span className="stat-val">4.8★</span><span className="stat-label">Rating</span></div>
                      <div className="stat-divider" />
                      <div className="stat"><span className="stat-val">30min</span><span className="stat-label">Delivery</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="slide-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`slide-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <button className="scroll-down" onClick={scrollToMenu}>
          <ChevronDown size={20} />
        </button>
      </section>

      {/* Menu Section */}
      <section className="menu-section container" id="menu-section">
        <div className="section-header">
          <div className="section-tag">Our Menu</div>
          <h2 className="section-title">What would you like <span className="accent-text">today?</span></h2>
        </div>

        <div className="search-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input search-input"
            placeholder="Search dishes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="category-bar">
          <button className={`cat-chip ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveCategory('all'); setSearch('') }}>
            🍽 All
          </button>
          {categories.map(cat => (
            <button key={cat._id}
              className={`cat-chip ${activeCategory === cat._id ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat._id); setSearch('') }}>
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="items-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton item-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-items"><span>🍽</span><p>No items found</p></div>
        ) : (
          <div className="items-grid">
            {filtered.map((item, i) => (
              <div key={item._id} style={{ animationDelay: `${i * 0.07}s` }}>
                <ItemCard item={item} onAuthRequired={onAuthRequired} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}