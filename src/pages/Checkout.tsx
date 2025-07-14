import React from 'react';
import { motion } from 'framer-motion';
import { PaymentProvider, usePayment } from '../contexts/PaymentContext';
import PaymentStepper from '../components/payment/PaymentStepper';
import CartReview from '../components/payment/CartReview';
import ShippingForm from '../components/payment/ShippingForm';
import PaymentForm from '../components/payment/PaymentForm';
import OrderReview from '../components/payment/OrderReview';
import { AnimatedBackground } from '../components/ui';

const CheckoutContent: React.FC = () => {
  const { currentStep } = usePayment();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CartReview />;
      case 2:
        return <ShippingForm />;
      case 3:
        return <PaymentForm />;
      case 4:
        return <OrderReview />;
      default:
        return <CartReview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Secure Checkout
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Complete your order in just a few simple steps
          </p>
        </motion.div>

        {/* Payment Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <PaymentStepper />
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </div>
    </div>
  );
};

const Checkout: React.FC = () => {
  return (
    <PaymentProvider>
      <CheckoutContent />
    </PaymentProvider>
  );
};

export default Checkout;