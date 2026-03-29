import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [token, setToken]   = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isLoggedIn, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
