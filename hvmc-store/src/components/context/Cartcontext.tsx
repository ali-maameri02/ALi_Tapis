import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// CartContext - Update CartItem type
type CartItem = {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  color?: string;
  selectedImage?: string;
  hauteur?: number | string;  // Add measurement fields
  largeur?: number | string;
  carr?: number | string;
};
type CartContextType = {
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
      const existingItem = prevItems.find(item => 
        item.id === product.id && item.color === product.color
      );
      let newItems;
      
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === product.id && item.color === product.color
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        newItems = [...prevItems, product];
      }
      
      return newItems;
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