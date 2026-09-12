import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartStorageKey = (user) => {
  if (user && (user._id || user.id)) {
    return `kisansetu_cart_${user._id || user.id}`;
  }
  return 'kisansetu_cart_guest';
};

const loadCartFromStorage = (key) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
  }
  return [];
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id || null;
  const prevUserIdRef = useRef(currentUserId);
  const isInitialMount = useRef(true);

  // Initialize state based on current user / guest
  const [cartItems, setCartItems] = useState(() => {
    // Migration helper: check legacy 'kisansetu_cart'
    const legacyCart = loadCartFromStorage('kisansetu_cart');
    const storageKey = getCartStorageKey(user);
    const existing = loadCartFromStorage(storageKey);
    if (existing.length > 0) return existing;
    if (legacyCart.length > 0) {
      localStorage.removeItem('kisansetu_cart');
      localStorage.setItem(storageKey, JSON.stringify(legacyCart));
      return legacyCart;
    }
    return [];
  });

  const maxConsumerLimitKg = 10; // Default max purchase limit for consumers

  // Sync cart when user logs in, logs out, or switches accounts
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = currentUserId;

    if (currentUserId && !prevUserId) {
      // Guest -> Logged In
      const userKey = `kisansetu_cart_${currentUserId}`;
      const userCart = loadCartFromStorage(userKey);
      const guestCart = loadCartFromStorage('kisansetu_cart_guest');

      let mergedCart = [...userCart];
      if (guestCart.length > 0) {
        guestCart.forEach((gItem) => {
          const idx = mergedCart.findIndex((uItem) => uItem.listingId === gItem.listingId);
          if (idx > -1) {
            mergedCart[idx].quantityKg += gItem.quantityKg;
          } else {
            mergedCart.push(gItem);
          }
        });
        localStorage.removeItem('kisansetu_cart_guest');
      }

      setCartItems(mergedCart);
      localStorage.setItem(userKey, JSON.stringify(mergedCart));
    } else if (!currentUserId && prevUserId) {
      // Logged in -> Logged Out (Logout)
      setCartItems([]);
      localStorage.removeItem('kisansetu_cart_guest');
    } else if (currentUserId && prevUserId && currentUserId !== prevUserId) {
      // Switched between user accounts
      const newUserKey = `kisansetu_cart_${currentUserId}`;
      const newUserCart = loadCartFromStorage(newUserKey);
      setCartItems(newUserCart);
    }
  }, [currentUserId]);

  // Persist current cartItems to active user / guest key
  useEffect(() => {
    const key = getCartStorageKey(user);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]);

  const addToCart = (listing, quantityKg) => {
    const qty = Number(quantityKg);
    if (!qty || qty <= 0) return;

    const existingIndex = cartItems.findIndex((item) => item.listingId === listing._id);
    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantityKg += qty;
    } else {
      updatedCart.push({
        listingId: listing._id,
        cropName: listing.cropName,
        pricePerKg: listing.pricePerKg,
        grade: listing.grade,
        quantityKg: qty,
        farmerName: listing.farmer?.name || 'Farmer Partner',
        farmerId: listing.farmer?._id || listing.farmer,
        batchId: listing.batchId,
        image: listing.images && listing.images[0] ? listing.images[0] : '',
      });
    }

    // Check Consumer Purchase Limit
    if (user?.role === 'CONSUMER') {
      const totalKg = updatedCart.reduce((sum, i) => sum + i.quantityKg, 0);
      if (totalKg > maxConsumerLimitKg) {
        throw new Error(
          `Consumer Order Limit Exceeded! You have ${totalKg} kg in cart. Consumer accounts are capped at max ${maxConsumerLimitKg} kg per order to ensure fair retail distribution. For bulk orders, use a Bulk Buyer account.`
        );
      }
    }

    setCartItems(updatedCart);
  };

  const removeFromCart = (listingId) => {
    setCartItems(cartItems.filter((i) => i.listingId !== listingId));
  };

  const clearCart = () => {
    setCartItems([]);
    const key = getCartStorageKey(user);
    localStorage.removeItem(key);
  };

  const totalProduceCost = cartItems.reduce((sum, item) => sum + item.quantityKg * item.pricePerKg, 0);
  const totalQuantityKg = cartItems.reduce((sum, item) => sum + item.quantityKg, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        totalProduceCost,
        totalQuantityKg,
        maxConsumerLimitKg,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
