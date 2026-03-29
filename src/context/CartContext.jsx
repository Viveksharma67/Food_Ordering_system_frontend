import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCart([]);
      return;
    }
    try {
      const res = await api.get('/cart');
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setCart([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to Cart
  const addToCart = async (itemId) => {
    try {
      const res = await api.post('/cart/add', { itemId });
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      fetchCart(); // fallback
    }
  };

  // === Main Fix for Quantity Update ===
  const updateQty = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // 1. Optimistic Update (UI turant badle)
    setCart(prev => 
      prev.map(cartItem => 
        cartItem.item?._id === itemId 
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );

    try {
      const res = await api.put('/cart/update', { itemId, quantity: newQuantity });
      
      // 2. Backend response ko safely set karo
      if (res.data && Array.isArray(res.data)) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Update qty failed:", err);
      fetchCart(); // error pe fresh fetch
    }
  };

  const removeFromCart = async (itemId) => {
    setCart(prev => prev.filter(c => c.item?._id !== itemId)); // optimistic

    try {
      const res = await api.delete(`/cart/remove/${itemId}`);
      if (res.data && Array.isArray(res.data)) {
        setCart(res.data);
      }
    } catch (err) {
      console.error(err);
      fetchCart();
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart([]);
    } catch (err) {
      console.error(err);
      fetchCart();
    }
  };

  const cartCount = cart.reduce((sum, c) => sum + (c?.quantity || 0), 0);
  const cartTotal = cart.reduce((sum, c) => sum + (c?.item?.price || 0) * (c?.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);