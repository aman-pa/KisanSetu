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

    const dist = listing.distanceKm || 18.5;

    // Small order restriction: < 5 kg requires distance <= 10 km
    if (qty < 5 && dist > 10) {
      throw new Error(
        `For small orders under 5 kg, seller distance must be within 10 km (Current distance: ${dist} km). Please order 5 kg or more to unlock long-distance shipping, or select a local seller!`
      );
    }

    const existingIndex = cartItems.findIndex((item) => item.listingId === listing._id);
    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      const newQty = updatedCart[existingIndex].quantityKg + qty;
      if (newQty < 5 && dist > 10) {
        throw new Error(
          `For small orders under 5 kg, seller distance must be within 10 km (Current distance: ${dist} km). Please order 5 kg or more to unlock long-distance shipping!`
        );
      }
      updatedCart[existingIndex].quantityKg = newQty;
    } else {
      updatedCart.push({
        listingId: listing._id,
        cropName: listing.cropName,
        pricePerKg: listing.pricePerKg,
        grade: listing.grade,
        quantityKg: qty,
        distanceKm: dist,
        farmerName: listing.farmer?.name || 'Farmer Partner',
        farmerId: listing.farmer?._id || listing.farmer,
        batchId: listing.batchId,
        image: listing.images && listing.images[0] ? listing.images[0] : '',
      });
    }

    setCartItems(updatedCart);
  };

  const updateQuantity = (listingId, newQuantityKg) => {
    const qty = Number(newQuantityKg);
    if (!qty || qty <= 0) {
      removeFromCart(listingId);
      return;
    }

    const itemToUpdate = cartItems.find((i) => i.listingId === listingId);
    if (itemToUpdate) {
      const dist = itemToUpdate.distanceKm || 18.5;
      if (qty < 5 && dist > 10) {
        throw new Error(
          `For small orders under 5 kg, seller distance must be within 10 km (Current distance: ${dist} km). Please order 5 kg or more to unlock long-distance shipping!`
        );
      }
    }

    const updatedCart = cartItems.map((item) => {
      if (item.listingId === listingId) {
        return { ...item, quantityKg: qty };
      }
      return item;
    });

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
        updateQuantity,
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
