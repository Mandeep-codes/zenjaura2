import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users,BookOpen, Calendar, BarChart3 } from 'lucide-react';
import axios from '../../contexts/axiosInstance';

interface AnalyticsData {
  userRegistrations: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  booksByStatus: Array<{
    _id: string;
    count: number;
  }>;
  popularGenres: Array<{
    _id: string;
    count: number;
  }>;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userRegistrations: [],
    booksByStatus: [],
    popularGenres: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
      case 'published':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getGenreColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Analytics Dashboard
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300">
            Insights and trends for your publishing platform
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Registrations Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  User Registrations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Monthly growth</p>
              </div>
            </div>

            {analytics.userRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No registration data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.userRegistrations.map((item, index) => {
                  const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ];
                  const maxCount = Math.max(...analytics.userRegistrations.map(r => r.count));
                  const percentage = (item.count / maxCount) * 100;

                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-16 text-sm text-gray-600 dark:text-gray-300">
                        {monthNames[item._id.month - 1]} {item._id.year}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-sm font-medium text-gray-900 dark:text-white">
                        {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Books by Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Books by Status
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Submission overview</p>
              </div>
            </div>

            {analytics.booksByStatus.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No book data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.booksByStatus.map((item, index) => {
                  const total = analytics.booksByStatus.reduce((sum, book) => sum + book.count, 0);
                  const percentage = (item.count / total) * 100;

                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-20 text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {item._id}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(item._id)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-sm font-medium text-gray-900 dark:text-white">
                        {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Popular Genres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:col-span-2"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Popular Genres
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Most published genres</p>
              </div>
            </div>

            {analytics.popularGenres.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No genre data available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {analytics.popularGenres.map((genre, index) => {
                  const maxCount = Math.max(...analytics.popularGenres.map(g => g.count));
                  const percentage = (genre.count / maxCount) * 100;

                  return (
                    <div key={index} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div
                          className={`absolute inset-0 rounded-full ${getGenreColor(index)} transition-all duration-500`}
                          style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + (percentage / 2)}% 0%, ${50 + (percentage / 2)}% 100%, 50% 100%)`
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {genre.count}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {genre._id}
                      </h3>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;