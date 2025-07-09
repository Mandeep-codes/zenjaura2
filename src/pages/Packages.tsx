import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import axios from '../contexts/axiosInstance.js';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

interface Package {
  _id: string;
  name: string;
  basePrice: number;
  description: string;
  features: Array<{ name: string; included: boolean }>;
  addOns: {
    printedCopies: {
      name: string;
      baseQuantity: number;
      maxQuantity: number;
      pricePerUnit: number;
    };
    extraPages: {
      name: string;
      basePagesIncluded: number;
      maxPages: number;
      pricePerPage: number;
    };
  };
  popular: boolean;
}

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [customizations, setCustomizations] = useState<{
    [key: string]: {
      printedCopies: number;
      totalPages: number;
    };
  }>({});
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('/api/packages');
        setPackages(response.data);
        
        // Initialize customizations
        const initialCustomizations: any = {};
        response.data.forEach((pkg: Package) => {
          initialCustomizations[pkg._id] = {
            printedCopies: pkg.addOns.printedCopies.baseQuantity,
            totalPages: pkg.addOns.extraPages.basePagesIncluded
          };
        });
        setCustomizations(initialCustomizations);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const calculatePrice = (pkg: Package) => {
    const custom = customizations[pkg._id];
    if (!custom) return pkg.basePrice;

    let totalPrice = pkg.basePrice;

    // Add printed copies cost
    if (custom.printedCopies > pkg.addOns.printedCopies.baseQuantity) {
      const extraCopies = custom.printedCopies - pkg.addOns.printedCopies.baseQuantity;
      totalPrice += extraCopies * pkg.addOns.printedCopies.pricePerUnit;
    }

    // Add extra pages cost
    if (custom.totalPages > pkg.addOns.extraPages.basePagesIncluded) {
      const extraPages = custom.totalPages - pkg.addOns.extraPages.basePagesIncluded;
      totalPrice += extraPages * pkg.addOns.extraPages.pricePerPage;
    }

    return totalPrice;
  };

  const updateCustomization = (packageId: string, field: 'printedCopies' | 'totalPages', value: number) => {
    setCustomizations(prev => ({
      ...prev,
      [packageId]: {
        ...prev[packageId],
        [field]: value
      }
    }));
  };

  const handleAddToCart = async (pkg: Package) => {
    try {
      const custom = customizations[pkg._id];
      await addToCart({
        type: 'package',
        package: pkg._id,
        quantity: 1,
        price: calculatePrice(pkg),
        packageCustomizations: custom
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
            Publishing Packages
          </motion.h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect package for your publishing journey. All packages include professional support and quality assurance.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => {
            const custom = customizations[pkg._id];
            const totalPrice = calculatePrice(pkg);

            return (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${
                  pkg.popular ? 'ring-2 ring-emerald-600 scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Package Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {pkg.name}
                    </h3>
                    <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      ${totalPrice}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Included Features:</h4>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className={`w-5 h-5 mr-3 ${
                            feature.included 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`} />
                          <span className={`text-sm ${
                            feature.included 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-400 dark:text-gray-500 line-through'
                          }`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Add-ons */}
                  {custom && (
                    <div className="mb-8 space-y-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Customize Your Package:</h4>
                      
                      {/* Printed Copies */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {pkg.addOns.printedCopies.name}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ${pkg.addOns.printedCopies.pricePerUnit}/copy
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateCustomization(
                              pkg._id, 
                              'printedCopies', 
                              Math.max(pkg.addOns.printedCopies.baseQuantity, custom.printedCopies - 10)
                            )}
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {custom.printedCopies} copies
                          </span>
                          <button
                            onClick={() => updateCustomization(
                              pkg._id, 
                              'printedCopies', 
                              Math.min(pkg.addOns.printedCopies.maxQuantity, custom.printedCopies + 10)
                            )}
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Total Pages */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {pkg.addOns.extraPages.name}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ${pkg.addOns.extraPages.pricePerPage}/page
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateCustomization(
                              pkg._id, 
                              'totalPages', 
                              Math.max(pkg.addOns.extraPages.basePagesIncluded, custom.totalPages - 50)
                            )}
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {custom.totalPages} pages
                          </span>
                          <button
                            onClick={() => updateCustomization(
                              pkg._id, 
                              'totalPages', 
                              Math.min(pkg.addOns.extraPages.maxPages, custom.totalPages + 50)
                            )}
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleAddToCart(pkg)}
                    className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      pkg.popular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                        : 'border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What's included in the review process?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Our team reviews your manuscript for quality, formatting, and content guidelines. 
                We provide feedback and suggestions for improvement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How long does publishing take?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                The publishing process typically takes 2-4 weeks depending on your chosen package 
                and any revisions needed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I upgrade my package later?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Yes, you can upgrade your package at any time during the publishing process. 
                You'll only pay the difference in price.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What formats will my book be available in?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                All packages include digital formats (PDF, EPUB). Print options are available 
                with Standard and Premium packages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;