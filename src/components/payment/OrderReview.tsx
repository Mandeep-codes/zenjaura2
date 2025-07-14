import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, Truck, Calendar, MapPin, Lock } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const OrderReview: React.FC = () => {
  const { 
    shippingInfo, 
    paymentMethod, 
    orderSummary, 
    prevStep, 
    processPayment, 
    processing 
  } = usePayment();
  const { items } = useCart();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    const success = await processPayment();
    if (success) {
      navigate('/profile?tab=orders');
    }
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
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review Your Order
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please review your order before placing it
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Items ({items.length})
            </h3>
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {item.type === 'book' && item.book ? (
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : item.type === 'event' && item.event ? (
                      <div className="w-12 h-16 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    ) : (
                      <div className="w-12 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.type === 'book' ? item.book?.title : 
                       item.type === 'event' ? item.event?.title : 
                       item.package?.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Shipping Address
                </h4>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>{shippingInfo?.firstName} {shippingInfo?.lastName}</p>
                <p>{shippingInfo?.address}</p>
                <p>{shippingInfo?.city}, {shippingInfo?.state} {shippingInfo?.zipCode}</p>
                <p>{shippingInfo?.country}</p>
                {shippingInfo?.phone && <p>Phone: {shippingInfo.phone}</p>}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Payment Method
                </h4>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {paymentMethod?.type === 'card' ? (
                  <>
                    <p>Credit Card ending in {paymentMethod.cardNumber?.slice(-4)}</p>
                    <p>{paymentMethod.cardName}</p>
                  </>
                ) : (
                  <p className="capitalize">{paymentMethod?.type}</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {orderSummary && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
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
                  {orderSummary.estimatedDelivery && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-300 pt-2">
                      <span>Estimated Delivery</span>
                      <span>{orderSummary.estimatedDelivery}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Your order is secured with 256-bit SSL encryption
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <motion.button
            type="button"
            onClick={prevStep}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back to Payment
          </motion.button>
          <motion.button
            onClick={handlePlaceOrder}
            disabled={processing}
            whileHover={!processing ? { scale: 1.02 } : {}}
            whileTap={!processing ? { scale: 0.98 } : {}}
            className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center space-x-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Place Order - ${orderSummary?.total.toFixed(2)}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderReview;