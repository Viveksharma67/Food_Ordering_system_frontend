import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, ClipboardList, Sun, Moon, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import './Navbar.css'

export default function Navbar({ onAuthOpen }) {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const { cartCount, setCartOpen } = useCart()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDrop, setUserDrop] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserDrop(false) }, [location])

  const handleCartClick = () => {
    if (!isLoggedIn) { onAuthOpen(); return }
    setCartOpen(true)
  }

  const handleOrdersClick = () => {
    if (!isLoggedIn) { onAuthOpen(); return }
    navigate('/orders')
    setMenuOpen(false)
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
        <div className="nav-inner container">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon">🌶</span>
            <span className="logo-text">Spice<span className="accent-text">Lane</span></span>
          </Link>

          {/* Desktop right side */}
          <div className="nav-right">
            {/* Desktop only buttons */}
            <div className="nav-desktop-actions">
              {isAdmin && (
                <Link to="/admin" className="btn btn-ghost nav-admin-btn">
                  <LayoutDashboard size={16} />
                  <span>Admin</span>
                </Link>
              )}
              <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="nav-icon-btn" onClick={handleOrdersClick} title="My Orders">
                <ClipboardList size={18} />
              </button>
              <button className="nav-icon-btn cart-btn" onClick={handleCartClick} title="Cart">
                <ShoppingCart size={18} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
              {isLoggedIn ? (
                <div className="user-menu-wrap">
                  <button className="user-avatar-btn" onClick={() => setUserDrop(d => !d)}>
                    <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                  </button>
                  {userDrop && (
                    <div className="user-dropdown glass-strong animate-scale-in">
                      <div className="dropdown-header">
                        <div className="user-avatar-lg">{user?.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p className="dropdown-name">{user?.name}</p>
                          <p className="dropdown-email">{user?.email}</p>
                        </div>
                      </div>
                      <hr className="dropdown-divider" />
                      <button className="dropdown-item" onClick={() => { navigate('/orders'); setUserDrop(false) }}>
                        <ClipboardList size={15} /> My Orders
                      </button>
                      <button className="dropdown-item danger" onClick={() => { logout(); setUserDrop(false) }}>
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="btn btn-primary signin-btn" onClick={onAuthOpen}>
                  <User size={15} /> Sign In
                </button>
              )}
            </div>

            {/* Mobile: cart badge + hamburger */}
            <div className="nav-mobile-actions">
              <button className="nav-icon-btn cart-btn" onClick={handleCartClick}>
                <ShoppingCart size={18} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
              <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="mobile-menu animate-fade-in">
            {/* User info if logged in */}
            {isLoggedIn && (
              <div className="mobile-user-info">
                <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="mobile-user-name">{user?.name}</p>
                  <p className="mobile-user-email">{user?.email}</p>
                </div>
              </div>
            )}

            <div className="mobile-menu-items">
              <button className="mobile-item" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button className="mobile-item" onClick={handleOrdersClick}>
                <ClipboardList size={17} />
                <span>My Orders</span>
              </button>

              {isAdmin && (
                <Link to="/admin" className="mobile-item" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={17} />
                  <span>Admin Panel</span>
                </Link>
              )}

              {isLoggedIn ? (
                <button className="mobile-item danger" onClick={() => { logout(); setMenuOpen(false) }}>
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>
              ) : (
                <button className="mobile-item accent" onClick={() => { onAuthOpen(); setMenuOpen(false) }}>
                  <User size={17} />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlays */}
      {userDrop && <div className="overlay-clear" onClick={() => setUserDrop(false)} />}
      {menuOpen && <div className="overlay-clear" onClick={() => setMenuOpen(false)} />}
    </>
  )
}