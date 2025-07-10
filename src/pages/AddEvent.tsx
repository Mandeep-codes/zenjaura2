import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from '../contexts/axiosInstance';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface FormValues {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  maxAttendees: number;
  price: number;
  category: string;
  image: string;
  tags: string;
}

const AddEvent = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormValues>();

  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const eventData = {
        ...data,
        tags: data.tags.split(',').map((tag) => tag.trim())
      };

      await axios.post('/api/events', eventData);

      toast.success('Event created successfully!');
      reset();
      navigate('/admin/events');
    } catch (error: any) {
      console.error('❌ Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const isVirtual = watch('isVirtual');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Event</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Title</label>
            <input {...register('title', { required: true })} className="input" />
            {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Description</label>
            <textarea {...register('description', { required: true })} rows={4} className="input" />
            {errors.description && <p className="text-red-500 text-sm">Description is required</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Start Date & Time</label>
              <input type="datetime-local" {...register('startDate', { required: true })} className="input" />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">End Date & Time</label>
              <input type="datetime-local" {...register('endDate', { required: true })} className="input" />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Location</label>
            <input 
              {...register('location', { required: 'Location is required' })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
              placeholder={isVirtual ? "Online via Zoom" : "Physical address"}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" {...register('isVirtual')} className="mr-2" />
              <span className="text-gray-700 dark:text-gray-200">Virtual Event</span>
            </label>
            {isVirtual && (
              <input
                placeholder="Virtual Link"
                type="url"
                {...register('virtualLink')}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Max Attendees</label>
              <input 
                type="number" 
                min="0"
                {...register('maxAttendees', { valueAsNumber: true })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                placeholder="0 for unlimited"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Price (₹)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                placeholder="0 for free"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Category</label>
            <select {...register('category')} className="input">
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Book Launch">Book Launch</option>
              <option value="Reading">Reading</option>
              <option value="Conference">Conference</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Image URL</label>
            <input 
              type="url"
              {...register('image')} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Tags (comma separated)</label>
            <input 
              {...register('tags')} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
              placeholder="workshop, writing, networking"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
