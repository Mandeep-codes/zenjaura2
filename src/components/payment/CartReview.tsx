import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Calendar, MapPin } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { usePayment } from '../../contexts/PaymentContext';
import { Link } from 'react-router-dom';

const CartReview: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalAmount } = useCart();
  const { nextStep } = usePayment();

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Add some items to your cart to continue
        </p>
        <Link
          to="/books"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Review Your Order
        </h2>

        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              {/* Item Image */}
              <div className="flex-shrink-0">
                {item.type === 'book' && item.book ? (
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                ) : item.type === 'event' && item.event ? (
                  <div className="w-16 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className="w-16 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.type === 'book' ? item.book?.title : 
                   item.type === 'event' ? item.event?.title : 
                   item.package?.name}
                </h3>
                
                {item.type === 'book' && item.book && (
                  <p className="text-gray-600 dark:text-gray-300">
                    by {item.book.author?.name}
                  </p>
                )}

                {item.type === 'event' && item.event && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(item.event.startDate).toLocaleDateString()}
                    </p>
                    <p className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.event.location}
                    </p>
                  </div>
                )}

                {item.type === 'package' && item.packageCustomizations && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <p>Printed Copies: {item.packageCustomizations.printedCopies}</p>
                    <p>Total Pages: {item.packageCustomizations.totalPages}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity Controls */}
                  {item.type === 'event' ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Event Registration
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item._id!, Math.max(1, item.quantity - 1))}
                        className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                        className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Price and Remove */}
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id!)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Shipping and taxes calculated at next step
          </p>
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-end">
          <motion.button
            onClick={nextStep}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Continue to Shipping
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartReview;