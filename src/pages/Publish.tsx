import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, BookOpen, FileText, Image, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from '../contexts/axiosInstance.js';
import toast from 'react-hot-toast';

interface Package {
  _id: string;
  name: string;
  basePrice: number;
  description: string;
  features: Array<{ name: string; included: boolean }>;
}

interface FormData {
  title: string;
  synopsis: string;
  genre: string;
  price: number;
  publishingPackage: string;
  tags: string;
  coAuthors: string;
  coverImage: FileList;
  manuscriptFile: FileList;
}

const Publish = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>();

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy',
    'Biography', 'History', 'Self-Help', 'Business', 'Poetry', 'Children', 'Other'
  ];


  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('/api/packages');
        setPackages(response.data);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      }
    };

    fetchPackages();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!selectedPackage) {
      toast.error('Please select a publishing package');
      return;
    }

    // Validate files
    if (!data.coverImage || !data.coverImage[0]) {
      toast.error('Please upload a cover image');
      return;
    }
    
    if (!data.manuscriptFile || !data.manuscriptFile[0]) {
      toast.error('Please upload a manuscript file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('synopsis', data.synopsis);
      formData.append('genre', data.genre);
      formData.append('price', data.price.toString());
      formData.append('publishingPackage', selectedPackage);
      
      // Handle tags safely
      const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      formData.append('tags', JSON.stringify(tags));
      formData.append('coAuthors', JSON.stringify([]));

      
      formData.append('coverImage', data.coverImage[0]);
      formData.append('manuscriptFile', data.manuscriptFile[0]);

      await axios.post('/api/books/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Book submitted successfully! We\'ll review it and get back to you.');
      setStep(4); // Success step
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to submit book';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your Publishing Package
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  onClick={() => {
                    setSelectedPackage(pkg._id);
                    setValue('publishingPackage', pkg._id);
                  }}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedPackage === pkg._id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {pkg.name}
                    </h3>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      ${pkg.basePrice}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {pkg.description}
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className={`w-4 h-4 mr-2 ${
                          feature.included 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`} />
                        <span className={feature.included 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-400 dark:text-gray-500'
                        }>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => selectedPackage && setStep(2)}
                disabled={!selectedPackage}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Book Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Book Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your book title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genre *
                </label>
                <select
                  {...register('genre', { required: 'Genre is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a genre</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Synopsis *
              </label>
              <textarea
                {...register('synopsis', { required: 'Synopsis is required' })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Provide a compelling synopsis of your book..."
              />
              {errors.synopsis && (
                <p className="mt-1 text-sm text-red-600">{errors.synopsis.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  {...register('tags')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="thriller, mystery, detective"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Book Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Minimum price is $0.01' },
                    valueAsNumber: true
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter book price"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Upload Files
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    {...register('coverImage', { required: 'Cover image is required' })}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="coverImage"
                  />
                  <label
                    htmlFor="coverImage"
                    className="cursor-pointer text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    Click to upload cover image
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                {errors.coverImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.coverImage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Manuscript File *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    {...register('manuscriptFile', { required: 'Manuscript file is required' })}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="manuscriptFile"
                  />
                  <label
                    htmlFor="manuscriptFile"
                    className="cursor-pointer text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    Click to upload manuscript
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    PDF, DOC, DOCX up to 50MB
                  </p>
                </div>
                {errors.manuscriptFile && (
                  <p className="mt-1 text-sm text-red-600">{errors.manuscriptFile.message}</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Submission Guidelines
                  </h3>
                  <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                    <li>Ensure your manuscript is properly formatted</li>
                    <li>Cover image should be high-resolution (at least 1600x2400px)</li>
                    <li>Review will take 3-5 business days</li>
                    <li>You'll receive email notifications about the status</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Book'
                )}
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Submission Successful!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Your book has been submitted for review. Our team will review your submission 
              and get back to you within 3-5 business days. You'll receive email notifications 
              about the status of your submission.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedPackage('');
                }}
                className="px-6 py-3 border border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                Submit Another Book
              </button>
              <button
                onClick={() => window.location.href = '/profile'}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                View My Submissions
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Publish Your Book
          </motion.h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Share your story with the world. Follow our simple process to get your book published.
          </p>
        </div>

        {/* Progress Steps */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber
                        ? 'bg-emerald-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-16">
              <span className="text-sm text-gray-600 dark:text-gray-300">Package</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Details</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Upload</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Publish;