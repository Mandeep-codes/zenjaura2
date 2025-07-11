import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Star, ShoppingCart, BookOpen } from 'lucide-react';
import axios from '../contexts/axiosInstance.js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import SearchInput from '../components/ui/SearchInput';
import LazyImage from '../components/ui/LazyImage';
import Skeleton from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

interface Book {
  _id: string;
  title: string;
  author: { name: string };
  synopsis: string;
  genre: string;
  coverImage: string;
  price: number;
  rating: { average: number; count: number };
  slug: string;
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  const genres = [
    'All', 'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Poetry'
  ];

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedGenre && selectedGenre !== 'All') params.append('genre', selectedGenre);

      const response = await axios.get(`/api/books?${params}`);
      setBooks(response.data.books || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setError('Failed to load books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchTerm, selectedGenre]);

  const handleAddToCart = async (book: Book) => {
    if (!user) {
      toast.error('Please login to add books to cart');
      return;
    }
    
    // Add price filtering
    if (filters.minPrice) {
      query.price = { ...query.price, $gte: parseFloat(filters.minPrice) };
    }
    if (filters.maxPrice) {
      query.price = { ...query.price, $lte: parseFloat(filters.maxPrice) };
    }

    // Add sorting
    let sortOptions = { createdAt: -1 };
    if (filters.sortBy === 'price-low') sortOptions = { price: 1 };
    if (filters.sortBy === 'price-high') sortOptions = { price: -1 };
    if (filters.sortBy === 'rating') sortOptions = { 'rating.average': -1 };

    try {
      await addToCart({
        type: 'book',
        book: book._id,
        quantity: 1,
        price: book.price
      });
    } catch (error) {
      console.error('Failed to add book to cart:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error}
            </h3>
            <button
              onClick={() => fetchBooks()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Discover Amazing Books
          </motion.h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our collection of published books from talented authors around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <SearchInput
                onSearch={handleSearch}
                placeholder="Search books by title or description..."
                className="flex-1"
              />

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none min-w-[150px]"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre === 'All' ? '' : genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="$999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ minPrice: '', maxPrice: '', sortBy: 'newest' });
                    setSelectedGenre('');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <Skeleton variant="rectangular" height="256px" />
                <div className="p-6">
                  <Skeleton lines={2} className="mb-4" />
                  <Skeleton height="32px" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No books found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search criteria or browse all books
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <LazyImage
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white px-2 py-1 rounded-full text-sm">
                    {book.genre}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    by {book.author.name}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {book.rating.average.toFixed(1)} ({book.rating.count})
                      </span>
                    </div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${book.price}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/books/${book.slug}`}
                      className="flex-1 text-center px-4 py-2 border border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(book)}
                      disabled={!user}
                      title={!user ? 'Please login to add to cart' : 'Add to cart'}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Books;
