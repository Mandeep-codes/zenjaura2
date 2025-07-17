import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, User, Calendar, BookOpen, ArrowLeft, Heart, Share2, Download, Eye, Truck, Shield, RotateCcw } from 'lucide-react';
import axios from '../contexts/axiosInstance';
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
  language?: string;
  publisher?: string;
  dimensions?: string;
  weight?: string;
  format?: string;
  discount?: number;
  originalPrice?: number;
  inStock?: boolean;
  stockCount?: number;
  deliveryTime?: string;
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
  const [selectedTab, setSelectedTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
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
        quantity: quantity,
        price: book.price
      });
    } catch (error) {
      // Error handled in context
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const shareBook = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title,
        text: `Check out "${book?.title}" by ${book?.author.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">Home</Link>
          <span>/</span>
          <Link to="/books" className="hover:text-emerald-600 dark:hover:text-emerald-400">Books</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{book.title}</span>
        </nav>
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
              <div className="relative mb-6">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full rounded-lg shadow-md mb-6"
              />
                
                {/* Discount Badge */}
                {book.discount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{book.discount}% OFF
                  </div>
                )}
              </div>
              
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
                  <div className="text-right">
                    {book.originalPrice && book.originalPrice > book.price ? (
                      <div>
                        <span className="text-lg text-gray-500 line-through">${book.originalPrice}</span>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          ${book.price}
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${book.price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${book.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${book.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {book.inStock ? `In Stock (${book.stockCount} available)` : 'Out of Stock'}
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!book.inStock}
                  className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {book.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={toggleWishlist}
                    className={`flex items-center justify-center px-4 py-2 border rounded-lg transition-colors ${
                      isWishlisted
                        ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                    Wishlist
                  </button>
                  <button
                    onClick={shareBook}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Free Delivery</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {book.deliveryTime || 'Delivered in 3-5 business days'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Easy Returns</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">30-day return policy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Secure Payment</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">100% secure transactions</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Genre:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{book.genre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Pages:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{book.pageCount}</span>
                  </div>
                  {book.language && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Language:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.language}</span>
                    </div>
                  )}
                  {book.format && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Format:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.format}</span>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">ISBN:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.isbn}</span>
                    </div>
                  )}
                  {book.publisher && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Publisher:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.publisher}</span>
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

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'details', label: 'Details' },
                    { id: 'reviews', label: `Reviews (${book.reviews.length})` },
                    { id: 'author', label: 'About Author' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        selectedTab === tab.id
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {selectedTab === 'description' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h2>
                    <div className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
                      !showFullDescription ? 'line-clamp-6' : ''
                    }`}>
                      {book.synopsis}
                    </div>
                    {book.synopsis.length > 300 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                      >
                        {showFullDescription ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                )}

                {selectedTab === 'details' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book Details</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-300">Genre</span>
                          <span className="font-medium text-gray-900 dark:text-white">{book.genre}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-300">Pages</span>
                          <span className="font-medium text-gray-900 dark:text-white">{book.pageCount}</span>
                        </div>
                        {book.language && (
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Language</span>
                            <span className="font-medium text-gray-900 dark:text-white">{book.language}</span>
                          </div>
                        )}
                        {book.format && (
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Format</span>
                            <span className="font-medium text-gray-900 dark:text-white">{book.format}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {book.isbn && (
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">ISBN</span>
                            <span className="font-medium text-gray-900 dark:text-white">{book.isbn}</span>
                          </div>
                        )}
                        {book.publisher && (
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Publisher</span>
                            <span className="font-medium text-gray-900 dark:text-white">{book.publisher}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-300">Published</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(book.publicationDate).toLocaleDateString()}
                          </span>
                        </div>
                        {book.dimensions && (
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Dimensions</span>
                            <span className="font-medium text-gray-900 dark:text-white">{book.dimensions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'author' && book.author.bio && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Author</h2>
                    <div className="flex items-start space-x-4 mb-6">
                      {book.author.avatar ? (
                        <img
                          src={book.author.avatar}
                          alt={book.author.name}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {book.author.name}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {book.author.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'reviews' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
                    {book.reviews.length > 0 ? (
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
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review this book!</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;