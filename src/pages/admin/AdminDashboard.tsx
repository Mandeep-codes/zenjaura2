// src/pages/admin/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Calendar, TrendingUp, Eye,
  CheckCircle, Clock, XCircle
} from 'lucide-react';
import axios from '../../contexts/axiosInstance';

interface Stats {
  totalUsers: number;
  totalBooks: number;
  publishedBooks: number;
  pendingBooks: number;
  totalEvents: number;
  totalOrders: number;
}

interface RecentBook {
  _id: string;
  title: string;
  author: { name: string };
  status: string;
  createdAt: string;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBooks: 0,
    publishedBooks: 0,
    pendingBooks: 0,
    totalEvents: 0,
    totalOrders: 0
  });
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        setStats(response.data.stats);
        setRecentBooks(response.data.recentBooks);
        setRecentUsers(response.data.recentUsers);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const updateBookStatus = async (bookId: string, newStatus: string) => {
    try {
      await axios.put(`/api/books/admin/${bookId}/status`, { status: newStatus });
      setRecentBooks(prev =>
        prev.map(book => book._id === bookId ? { ...book, status: newStatus } : book)
      );
    } catch (error) {
      console.error('Failed to update book status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
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
            Admin Dashboard
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300">
            Overview of your publishing platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
            { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'bg-emerald-500' },
            { label: 'Published', value: stats.publishedBooks, icon: CheckCircle, color: 'bg-green-500' },
            { label: 'Pending', value: stats.pendingBooks, icon: Clock, color: 'bg-yellow-500' },
            { label: 'Events', value: stats.totalEvents, icon: Calendar, color: 'bg-purple-500' },
            { label: 'Orders', value: stats.totalOrders, icon: TrendingUp, color: 'bg-red-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Book Submissions */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Book Submissions</h2>
            {recentBooks.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No recent submissions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBooks.map((book) => (
                  <div key={book._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{book.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(book.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(book.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </span>
                      </div>
                      {book.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookStatus(book._id, 'published')}
                            className="text-green-600 border border-green-600 px-2 py-1 rounded text-xs hover:bg-green-600 hover:text-white transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateBookStatus(book._id, 'rejected')}
                            className="text-red-600 border border-red-600 px-2 py-1 rounded text-xs hover:bg-red-600 hover:text-white transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Users */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Users</h2>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No recent users</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
