import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import axios from './axiosInstance';
import toast from 'react-hot-toast';

interface PaymentState {
  currentStep: number;
  totalSteps: number;
  shippingInfo: ShippingInfo | null;
  paymentMethod: PaymentMethod | null;
  orderSummary: OrderSummary | null;
  processing: boolean;
  errors: Record<string, string>;
  completedSteps: number[];
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface PaymentMethod {
  type: 'card' | 'paypal' | 'apple_pay';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
  saveCard?: boolean;
}

interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  estimatedDelivery?: string;
}

interface PaymentContextType extends PaymentState {
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateShippingInfo: (info: Partial<ShippingInfo>) => void;
  updatePaymentMethod: (method: Partial<PaymentMethod>) => void;
  validateCurrentStep: () => boolean;
  processPayment: () => Promise<boolean>;
  resetPayment: () => void;
  calculateOrderSummary: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

type PaymentAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_SHIPPING'; payload: Partial<ShippingInfo> }
  | { type: 'UPDATE_PAYMENT'; payload: Partial<PaymentMethod> }
  | { type: 'UPDATE_ORDER_SUMMARY'; payload: OrderSummary }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'RESET' };

const paymentReducer = (state: PaymentState, action: PaymentAction): PaymentState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'NEXT_STEP':
      return { 
        ...state, 
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        completedSteps: [...new Set([...state.completedSteps, state.currentStep])]
      };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case 'UPDATE_SHIPPING':
      return { 
        ...state, 
        shippingInfo: { ...state.shippingInfo, ...action.payload } as ShippingInfo,
        errors: { ...state.errors, shipping: '' }
      };
    case 'UPDATE_PAYMENT':
      return { 
        ...state, 
        paymentMethod: { ...state.paymentMethod, ...action.payload } as PaymentMethod,
        errors: { ...state.errors, payment: '' }
      };
    case 'UPDATE_ORDER_SUMMARY':
      return { ...state, orderSummary: action.payload };
    case 'SET_PROCESSING':
      return { ...state, processing: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'COMPLETE_STEP':
      return { 
        ...state, 
        completedSteps: [...new Set([...state.completedSteps, action.payload])]
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const initialState: PaymentState = {
  currentStep: 1,
  totalSteps: 4,
  shippingInfo: null,
  paymentMethod: null,
  orderSummary: null,
  processing: false,
  errors: {},
  completedSteps: []
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  // Initialize with user data
  useEffect(() => {
    if (user && !state.shippingInfo) {
      dispatch({
        type: 'UPDATE_SHIPPING',
        payload: {
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          country: 'United States'
        }
      });
    }
  }, [user, state.shippingInfo]);

  // Calculate order summary when cart changes
  useEffect(() => {
    calculateOrderSummary();
  }, [items, totalAmount]);

  const calculateOrderSummary = () => {
    const subtotal = totalAmount;
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const discount = 0; // Could implement promo codes
    const total = subtotal + tax + shipping - discount;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    dispatch({
      type: 'UPDATE_ORDER_SUMMARY',
      payload: {
        subtotal,
        tax,
        shipping,
        discount,
        total,
        estimatedDelivery: estimatedDelivery.toLocaleDateString()
      }
    });
  };

  const validateShipping = (): boolean => {
    const errors: Record<string, string> = {};
    const { shippingInfo } = state;

    if (!shippingInfo?.firstName) errors.firstName = 'First name is required';
    if (!shippingInfo?.lastName) errors.lastName = 'Last name is required';
    if (!shippingInfo?.email) errors.email = 'Email is required';
    if (!shippingInfo?.address) errors.address = 'Address is required';
    if (!shippingInfo?.city) errors.city = 'City is required';
    if (!shippingInfo?.state) errors.state = 'State is required';
    if (!shippingInfo?.zipCode) errors.zipCode = 'ZIP code is required';

    if (shippingInfo?.email && !/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      errors.email = 'Invalid email format';
    }

    dispatch({ type: 'SET_ERRORS', payload: errors });
    return Object.keys(errors).length === 0;
  };

  const validatePayment = (): boolean => {
    const errors: Record<string, string> = {};
    const { paymentMethod } = state;

    if (!paymentMethod?.type) errors.paymentType = 'Payment method is required';
    
    if (paymentMethod?.type === 'card') {
      if (!paymentMethod?.cardNumber) errors.cardNumber = 'Card number is required';
      if (!paymentMethod?.expiryDate) errors.expiryDate = 'Expiry date is required';
      if (!paymentMethod?.cvv) errors.cvv = 'CVV is required';
      if (!paymentMethod?.cardName) errors.cardName = 'Name on card is required';

      // Basic card validation
      if (paymentMethod?.cardNumber && paymentMethod.cardNumber.replace(/\s/g, '').length < 13) {
        errors.cardNumber = 'Invalid card number';
      }
    }

    dispatch({ type: 'SET_ERRORS', payload: errors });
    return Object.keys(errors).length === 0;
  };

  const validateCurrentStep = (): boolean => {
    switch (state.currentStep) {
      case 1: // Cart Review
        return items.length > 0;
      case 2: // Shipping
        return validateShipping();
      case 3: // Payment
        return validatePayment();
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep });
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const prevStep = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const goToStep = (step: number) => {
    if (step <= state.currentStep || state.completedSteps.includes(step - 1)) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  };

  const updateShippingInfo = (info: Partial<ShippingInfo>) => {
    dispatch({ type: 'UPDATE_SHIPPING', payload: info });
  };

  const updatePaymentMethod = (method: Partial<PaymentMethod>) => {
    dispatch({ type: 'UPDATE_PAYMENT', payload: method });
  };

  const processPayment = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderData = {
        ...state.shippingInfo,
        ...state.paymentMethod,
        orderSummary: state.orderSummary
      };

      await axios.post('/api/orders/create', orderData);
      
      toast.success('Payment successful! Order confirmed.');
      clearCart();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
      return false;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const resetPayment = () => {
    dispatch({ type: 'RESET' });
  };

  const value: PaymentContextType = {
    ...state,
    nextStep,
    prevStep,
    goToStep,
    updateShippingInfo,
    updatePaymentMethod,
    validateCurrentStep,
    processPayment,
    resetPayment,
    calculateOrderSummary
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};