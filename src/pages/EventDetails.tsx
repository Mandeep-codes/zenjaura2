import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Video, ArrowLeft, User } from 'lucide-react';
import axios from '../contexts/axiosInstance.js';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  maxAttendees: number;
  registeredUsers: Array<{
    user: { name: string; avatar?: string };
    registeredAt: string;
  }>;
  price: number;
  category: string;
  organizer: { name: string; avatar?: string };
  image: string;
  tags: string[];
}

const EventDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${slug}`);
        setEvent(response.data);
        
        // Check if user is already registered
        if (user && response.data.registeredUsers) {
          const userRegistered = response.data.registeredUsers.some(
            (reg: any) => reg.user._id === user.id
          );
          setIsRegistered(userRegistered);
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
        toast.error('Event not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug, user]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      return;
    }

    if (event?.price === 0) {
      // Free event - register directly
      try {
        setRegistering(true);
        await axios.post(`/api/events/${event?._id}/register`);
        setIsRegistered(true);
        toast.success('Successfully registered for event!');
        
        // Refresh event data
        const response = await axios.get(`/api/events/${slug}`);
        setEvent(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to register for event');
      } finally {
        setRegistering(false);
      }
    } else {
      // Paid event - redirect to add to cart
      const { addToCart } = await import('../contexts/CartContext');
      // This is now handled by the cart context properly
      toast.info('Please add the event to cart to complete registration');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      return;
    }

    try {
      await addToCart({
        type: 'event',
        event: event?._id,
        quantity: 1,
        price: event?.price || 0
      });
    } catch (error: any) {
      toast.error('Failed to add event to cart');
    }
  };

  const getAvailableSpots = () => {
    if (!event) return 0;
    if (event.maxAttendees === 0) return 'Unlimited';
    return event.maxAttendees - event.registeredUsers.length;
  };

  const isEventFull = () => {
    if (!event) return false;
    return event.maxAttendees > 0 && event.registeredUsers.length >= event.maxAttendees;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The event you're looking for doesn't exist.</p>
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 left-4 flex space-x-2">
              <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm">
                {event.category}
              </span>
              {event.isVirtual && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Video className="w-3 h-3 mr-1" />
                  Virtual
                </span>
              )}
            </div>
            {event.price === 0 && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  Free
                </span>
              </div>
            )}
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {event.title}
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-medium">
                      {format(new Date(event.startDate), 'EEEE, MMMM dd, yyyy')}
                    </div>
                    <div className="text-sm">
                      {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Users className="w-5 h-5 mr-3" />
                  <span>{getAvailableSpots()} spots available</span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <User className="w-5 h-5 mr-3" />
                  <span>Organized by {event.organizer.name}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {event.registeredUsers.length} registered
                  </div>
                </div>

                {isAuthenticated ? (
                  isRegistered ? (
                    <div className="text-center">
                      <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg mb-2">
                        ✓ You're registered!
                      </div>
                      {event.isVirtual && event.virtualLink && (
                        <a
                          href={event.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Virtual Event
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {event.price === 0 ? (
                        <button
                          onClick={handleRegister}
                          disabled={registering || isEventFull()}
                          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                            isEventFull()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {registering ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Registering...</span>
                            </div>
                          ) : isEventFull() ? (
                            'Event Full'
                          ) : (
                            'Register Free'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleAddToCart}
                          disabled={isEventFull()}
                          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                            isEventFull()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isEventFull() ? 'Event Full' : 'Add to Cart'}
                        </button>
                      )}
                    </div>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="w-full text-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Login to Register
                  </Link>
                )}
              </div>
            </div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Event Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </motion.div>

        {/* Registered Attendees */}
        {event.registeredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Registered Attendees ({event.registeredUsers.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {event.registeredUsers.slice(0, 12).map((registration, index) => (
                <div key={index} className="text-center">
                  {registration.user.avatar ? (
                    <img
                      src={registration.user.avatar}
                      alt={registration.user.name}
                      className="w-12 h-12 rounded-full mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {registration.user.name}
                  </p>
                </div>
              ))}
              {event.registeredUsers.length > 12 && (
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      +{event.registeredUsers.length - 12}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">more</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;