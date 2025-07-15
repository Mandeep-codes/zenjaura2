import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Star, 
  TrendingUp, 
  ArrowRight, 
  Award,
  Shield,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  Heart,
  ShoppingCart
} from 'lucide-react';
import axios from 'axios';
import { GlassCard, NeonButton, GradientText, ModernCard, AnimatedBackground } from '../components/ui';

interface Stats {
  totalBooks: number;
  totalAuthors: number;
  averageRating: number;
  totalSales: number;
}

interface FeaturedBook {
  _id: string;
  title: string;
  author: { name: string };
  coverImage: string;
  genre: string;
  rating: { average: number };
  price: number;
  slug: string;
  discount?: number;
  originalPrice?: number;
}

const Home = () => {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalAuthors: 0,
    averageRating: 0,
    totalSales: 0
  });
  const [featuredBooks, setFeaturedBooks] = useState<FeaturedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats with fallback
        try {
          const statsRes = await axios.get('/api/books/stats');
          setStats(statsRes.data);
        } catch (statsError) {
          console.warn('Failed to fetch stats:', statsError);
          // Keep default stats
        }
        
        // Fetch featured books with fallback
        try {
          const booksRes = await axios.get('/api/books?featured=true&limit=6');
          setFeaturedBooks(booksRes.data.books || []);
        } catch (booksError) {
          console.warn('Failed to fetch featured books:', booksError);
          // Keep empty array
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
        // Don't show error toast on homepage - just log it
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchTerm)}`;
    }
  };
  const features = [
    {
      icon: BookOpen,
      title: 'Professional Publishing',
      description: 'Industry-standard publishing with meticulous attention to detail'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security keeps your manuscripts protected'
    },
    {
      icon: Users,
      title: 'Global Reach',
      description: 'Connect with readers worldwide through our distribution network'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Professional editing and design for every publication'
    }
  ];

  const packages = [
    {
      name: 'Essential',
      price: '$99',
      description: 'Perfect for first-time authors',
      features: ['Digital Publishing', 'Basic Marketing', '1 Revision Round'],
      popular: false
    },
    {
      name: 'Professional',
      price: '$299',
      description: 'Most popular choice for serious authors',
      features: ['Print + Digital', 'Enhanced Marketing', '3 Revision Rounds', 'ISBN Assignment'],
      popular: true
    },
    {
      name: 'Premium',
      price: '$599',
      description: 'Complete publishing solution',
      features: ['Premium Distribution', 'Full Marketing Suite', 'Unlimited Revisions', 'Dedicated Support'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" />
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Next-Generation Publishing</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <GradientText variant="primary" className="block">
                  Publish Your
                </GradientText>
                <GradientText variant="primary" className="block text-6xl md:text-8xl">
                  Story
                </GradientText>
                <GradientText variant="secondary" className="block text-4xl md:text-6xl">
                  Beautifully
                </GradientText>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
                Transform your manuscript into a professionally published book with our streamlined platform designed for modern authors.
              </p>
            </motion.div>

            {/* Hero Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for books, authors, or genres..."
                    className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/publish">
                <NeonButton
                  variant="primary"
                  size="lg"
                  icon={BookOpen}
                  className="text-lg px-8 py-4"
                >
                  Start Publishing
                </NeonButton>
              </Link>
              
              <Link to="/books">
                <NeonButton
                  variant="secondary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="text-lg px-8 py-4"
                >
                  Explore Books
                </NeonButton>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { icon: BookOpen, label: 'Published Books', value: stats.totalBooks },
                { icon: Users, label: 'Authors', value: stats.totalAuthors },
                { icon: Star, label: 'Average Rating', value: stats.averageRating.toFixed(1) },
                { icon: TrendingUp, label: 'Books Sold', value: stats.totalSales }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <GlassCard key={index} className="p-6 text-center" hover>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                      <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {loading ? '...' : stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </GlassCard>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GradientText variant="primary" className="text-4xl md:text-5xl font-bold mb-4">
                Why Choose Zenjaura
              </GradientText>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-light">
                Experience publishing excellence with our carefully crafted platform
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ModernCard variant="default" className="text-center h-full" hover>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
                      <Icon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-light">
                      {feature.description}
                    </p>
                  </ModernCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <GradientText variant="primary" className="text-4xl md:text-5xl font-bold mb-4">
                Featured Books
              </GradientText>
              <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
                Discover exceptional stories from our community
              </p>
            </div>
            <Link to="/books">
              <NeonButton variant="secondary" icon={ArrowRight} iconPosition="right">
                View All Books
              </NeonButton>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <GlassCard className="p-6">
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </GlassCard>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBooks.map((book, index) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ModernCard variant="default" className="overflow-hidden group" hover>
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-800">
                        {book.genre}
                      </div>
                      
                      {/* Discount Badge */}
                      {book.discount && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{book.discount}% OFF
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                        <button className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/books/${book.slug}`}
                          className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
                        >
                          <BookOpen className="w-5 h-5" />
                        </Link>
                        <button className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 font-light">
                      by {book.author.name}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {book.rating.average.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        {book.originalPrice && book.originalPrice > book.price ? (
                          <div>
                            <span className="text-sm text-gray-500 line-through">${book.originalPrice}</span>
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              ${book.price}
                            </div>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${book.price}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Link to={`/books/${book.slug}`}>
                      <NeonButton variant="minimal" fullWidth>
                        View Details
                      </NeonButton>
                    </Link>
                  </ModernCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Packages Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <GradientText variant="primary" className="text-4xl md:text-5xl font-bold mb-4">
              Publishing Packages
            </GradientText>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-light">
              Choose the perfect package for your publishing journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                <ModernCard 
                  variant={pkg.popular ? "bordered" : "default"}
                  className={`text-center h-full ${pkg.popular ? 'border-black dark:border-white' : ''}`}
                  hover
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.name}
                  </h3>
                  
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.price}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6 font-light">
                    {pkg.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/packages">
                    <NeonButton 
                      variant={pkg.popular ? "primary" : "secondary"} 
                      fullWidth
                    >
                      Choose Package
                    </NeonButton>
                  </Link>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <ModernCard variant="elevated" className="p-12">
              <GradientText variant="primary" className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Publish Your Story?
              </GradientText>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto font-light">
                Join thousands of successful authors who have brought their stories to life with Zenjaura's professional publishing platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <NeonButton variant="primary" size="lg" icon={BookOpen}>
                    Start Your Journey
                  </NeonButton>
                </Link>
                <Link to="/events">
                  <NeonButton variant="secondary" size="lg" icon={Calendar}>
                    Upcoming Events
                  </NeonButton>
                </Link>
              </div>
            </ModernCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;