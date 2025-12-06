import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { Product } from '@/types';
import { purchaseApi } from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onPurchase: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPurchase }) => {
  const { user, updateUser } = useAuthStore();
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }

    setIsPurchasing(true);
    try {
      const response = await purchaseApi.createPurchase(
        product.id,
        product.name,
        product.price
      );
      
      updateUser({ credits: response.user.credits });
      onPurchase(product);
      toast.success(`Purchased ${product.name}! Earned ${response.purchase.creditsEarned} credits`);
    } catch (error: any) {
      toast.error(error.error || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-600" />
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full">
            ${product.price}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">4.8</span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Earn 2 credits on first purchase
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="btn-primary flex items-center space-x-2"
          >
            {isPurchasing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            <span>Buy Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;