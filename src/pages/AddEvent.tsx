import React from 'react';
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
      const eventData = {
        ...data,
        tags: data.tags.split(',').map((tag) => tag.trim())
      };

      await axios.post('/api/events', eventData);

      toast.success('Event created successfully!');
      reset();
      navigate('/events');
    } catch (error: any) {
      console.error('❌ Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create event');
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
            <input {...register('location', { required: true })} className="input" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" {...register('isVirtual')} className="mr-2" />
              <span className="text-gray-700 dark:text-gray-200">Virtual Event</span>
            </label>
            {isVirtual && (
              <input
                placeholder="Virtual Link"
                {...register('virtualLink')}
                className="input flex-1"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Max Attendees</label>
              <input type="number" {...register('maxAttendees')} className="input" />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Price (₹)</label>
              <input type="number" {...register('price')} className="input" />
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
            <input {...register('image')} className="input" />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Tags (comma separated)</label>
            <input {...register('tags')} className="input" />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
