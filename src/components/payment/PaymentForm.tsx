import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';

const PaymentForm: React.FC = () => {
  const { 
    paymentMethod, 
    updatePaymentMethod, 
    nextStep, 
    prevStep, 
    errors,
    validateCurrentStep,
    orderSummary 
  } = usePayment();

  const [showCvv, setShowCvv] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    updatePaymentMethod({ [field]: value });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Method
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose how you'd like to pay
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              Your payment information is secure and encrypted
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Payment Method *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'card', label: 'Credit Card', icon: CreditCard },
                { id: 'paypal', label: 'PayPal', icon: CreditCard },
                { id: 'apple_pay', label: 'Apple Pay', icon: CreditCard }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <motion.button
                    key={method.id}
                    type="button"
                    onClick={() => handleInputChange('type', method.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod?.type === method.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {method.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {errors.paymentType && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentType}</p>
            )}
          </div>

          {/* Credit Card Form */}
          {paymentMethod?.type === 'card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6"
            >
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={paymentMethod?.cardNumber || ''}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.cardNumber ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    value={paymentMethod?.expiryDate || ''}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.expiryDate ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV *
                  </label>
                  <div className="relative">
                    <input
                      type={showCvv ? 'text' : 'password'}
                      value={paymentMethod?.cvv || ''}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-4 pr-10 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                        errors.cvv ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="123"
                      maxLength={4}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCvv ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Name on Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name on Card *
                </label>
                <input
                  type="text"
                  value={paymentMethod?.cardName || ''}
                  onChange={(e) => handleInputChange('cardName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.cardName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="John Doe"
                />
                {errors.cardName && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                )}
              </div>

              {/* Save Card Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={paymentMethod?.saveCard || false}
                  onChange={(e) => handleInputChange('saveCard', e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Save this card for future purchases
                </label>
              </div>
            </motion.div>
          )}

          {/* Order Summary */}
          {orderSummary && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tax</span>
                  <span>${orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <motion.button
              type="button"
              onClick={prevStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Shipping
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Review Order</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default PaymentForm;