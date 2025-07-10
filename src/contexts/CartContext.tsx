import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from './axiosInstance.js';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface CartItem {
  _id?: string;
  type: 'book' | 'package' | 'event';
  book?: any;
  package?: any;
  event?: any;
  packageCustomizations?: {
    printedCopies: number;
    totalPages: number;
  };
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  loading: boolean;
}

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, '_id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: { items: CartItem[]; totalAmount: number } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        totalAmount: action.payload.totalAmount,
        loading: false
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalAmount: 0,
        loading: false
      };
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  loading: false
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/cart');
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.items,
          totalAmount: response.data.totalAmount
        }
      });
    } catch (error) {
      console.error('Failed to load cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (item: Omit<CartItem, '_id'>) => {
    try {
      const response = await axios.post('/api/cart/add', item);
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.items,
          totalAmount: response.data.totalAmount
        }
      });
      if (item.type === 'event') {
        toast.success('Event added to cart');
      } else if (item.type === 'book') {
        toast.success('Book added to cart');
      } else {
        toast.success('Package added to cart');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await axios.delete(`/api/cart/remove/${itemId}`);
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.items,
          totalAmount: response.data.totalAmount
        }
      });
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item from cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await axios.put(`/api/cart/update/${itemId}`, { quantity });
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.items,
          totalAmount: response.data.totalAmount
        }
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear');
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};