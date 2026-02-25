import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  message, 
  title = "Success!" 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 mb-8">{message}</p>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-clinic-teal hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-clinic-teal/20"
              >
                Continue
              </button>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
