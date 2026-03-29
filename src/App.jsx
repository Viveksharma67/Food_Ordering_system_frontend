import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar/Navbar'
import CartDrawer from './components/Cart/CartDrawer'
import AuthModal from './components/Auth/AuthModal'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import Footer from './components/Footer/Footer'
function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/" />
  if (adminOnly && !isAdmin) return <Navigate to="/" />
  return children
}

function AppInner() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <Navbar onAuthOpen={() => setAuthOpen(true)} />
      <CartDrawer />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <Routes>
        <Route path="/"         element={<Home onAuthRequired={() => setAuthOpen(true)} />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/admin"    element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.88rem',
          },
          success: { iconTheme: { primary: '#4caf7d', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e05555', secondary: '#fff' } },
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppInner />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
