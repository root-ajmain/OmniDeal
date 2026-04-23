import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-gray-200 border-t-brand-600 rounded-full"
      />
    </div>
  );
}
