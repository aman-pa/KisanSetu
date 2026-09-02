import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();
  const maxConsumerLimitKg = 10; // Default max purchase limit for consumers

  useEffect(() => {
    const savedCart = localStorage.getItem('kisansetu_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kisansetu_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (listing, quantityKg) => {
    const qty = Number(quantityKg);
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
