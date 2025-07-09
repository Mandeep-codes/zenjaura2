import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, User, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import axios from '../contexts/axiosInstance.js';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

interface Book {
  _id: string;
  title: string;
  author: { name: string; avatar?: string; bio?: string };
  coAuthors: { name: string; avatar?: string }[];
  synopsis: string;
  genre: string;
  coverImage: string;
  price: number;
  rating: { average: number; count: number };
  tags: string[];
  isbn?: string;
  pageCount: number;
  publicationDate: string;
  reviews: Array<{
    user: { name: string; avatar?: string };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

const BookDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`/api/books/${slug}`);
        setBook(response.data);
      } catch (error) {
        console.error('Failed to fetch book:', error);
        toast.error('Book not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBook();
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!book) return;
    
    try {
      await addToCart({
        type: 'book',
        book: book._id,
        quantity: 1,
        price: book.price
      });
    } catch (error) {
      // Error handled in context
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The book you're looking for doesn't exist.</p>
          <Link
            to="/books"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/books"
          className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Books
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8"
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full rounded-lg shadow-md mb-6"
              />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {book.rating.average.toFixed(1)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      ({book.rating.count} reviews)
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${book.price}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Genre:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{book.genre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Pages:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{book.pageCount}</span>
                  </div>
                  {book.isbn && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">ISBN:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.isbn}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Published:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(book.publicationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Author */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {book.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  {book.author.avatar ? (
                    <img
                      src={book.author.avatar}
                      alt={book.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {book.author.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Author</p>
                  </div>
                </div>

                {book.coAuthors.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-300">Co-authors:</span>
                    <div className="flex space-x-2">
                      {book.coAuthors.map((coAuthor, index) => (
                        <span key={index} className="text-emerald-600 dark:text-emerald-400">
                          {coAuthor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {book.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Synopsis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {book.synopsis}
              </p>
            </motion.div>

            {/* Author Bio */}
            {book.author.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Author</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {book.author.bio}
                </p>
              </motion.div>
            )}

            {/* Reviews */}
            {book.reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reviews</h2>
                <div className="space-y-6">
                  {book.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        {review.user.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {review.user.name}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">
                            {review.comment}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;