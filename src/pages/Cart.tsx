import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { items, totalAmount, updateQuantity, removeFromCart, clearCart, loading } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Discover amazing books and publishing packages to get started
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/books"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Browse Books
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/packages"
                className="inline-flex items-center px-6 py-3 border border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Shopping Cart
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-4">
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
                          {new Date(item.event.startDate).toLocaleDateString()} at {new Date(item.event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        {item.bookId && (
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Publishing package for approved book
                          </p>
                        )}
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
                </div>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: items.length * 0.1 }}
              className="text-center pt-4"
            >
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Clear Cart
              </button>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>

              <div className="mt-4 text-center">
                <Link
                  to="/books"
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;