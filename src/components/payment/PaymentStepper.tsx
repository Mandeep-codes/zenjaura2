import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, Truck, CreditCard, FileCheck } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';

const PaymentStepper: React.FC = () => {
  const { currentStep, totalSteps, completedSteps, goToStep } = usePayment();

  const steps = [
    { id: 1, title: 'Cart', icon: ShoppingCart, description: 'Review items' },
    { id: 2, title: 'Shipping', icon: Truck, description: 'Delivery details' },
    { id: 3, title: 'Payment', icon: CreditCard, description: 'Payment method' },
    { id: 4, title: 'Review', icon: FileCheck, description: 'Confirm order' }
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 z-0">
          <motion.div
            className="h-full bg-emerald-600"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = step.id <= currentStep || completedSteps.includes(step.id - 1);

          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : isCurrent 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-200 dark:ring-emerald-800' 
                    : isClickable
                    ? 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  }
                `}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </motion.button>

              <div className="text-center">
                <p className={`
                  text-sm font-medium transition-colors
                  ${isCurrent || isCompleted 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentStepper;