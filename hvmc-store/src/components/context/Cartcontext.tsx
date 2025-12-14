// Cartcontext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: string; // Store as string with currency for display
  image: string;
  quantity: number;
  color?: string;
  selectedImage?: string;
  longueur?: string;
  poids?: string;
  metre_price?: string;
};

export type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartCount: number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to load cart from localStorage
const getInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }
  return [];
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCart);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: CartItem) => {
    setCartItems(prevItems => {
      // Check if this exact product (same id, color, and length) already exists
      const existingItem = prevItems.find(item => 
        item.id === product.id && 
        item.color === product.color &&
        item.longueur === product.longueur
      );
      
      if (existingItem) {
        // Update quantity for existing item
        return prevItems.map(item =>
          item.id === product.id && 
          item.color === product.color &&
          item.longueur === product.longueur
            ? { 
                ...item, 
                quantity: item.quantity + product.quantity,
                price: product.price // Update price in case it changed
              }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, product];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        cartCount,
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};