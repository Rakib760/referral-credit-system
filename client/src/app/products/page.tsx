'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/Products/ProductCard';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium E-book Bundle',
    description: 'Collection of 10 premium e-books on web development and design.',
    price: 49.99,
    image: '/images/ebook-bundle.jpg',
    category: 'Digital Books',
  },
  {
    id: '2',
    name: 'UI Design Templates',
    description: 'Professional Figma templates for modern web applications.',
    price: 29.99,
    image: '/images/ui-templates.jpg',
    category: 'Design Assets',
  },
  {
    id: '3',
    name: 'Online Course: React Mastery',
    description: 'Complete React course with projects and certification.',
    price: 79.99,
    image: '/images/react-course.jpg',
    category: 'Courses',
  },
  {
    id: '4',
    name: 'Stock Photo Pack',
    description: '1000+ high-quality stock photos for commercial use.',
    price: 19.99,
    image: '/images/stock-photos.jpg',
    category: 'Media',
  },
  {
    id: '5',
    name: 'SaaS Starter Kit',
    description: 'Full-stack SaaS template with authentication and payments.',
    price: 149.99,
    image: '/images/saas-kit.jpg',
    category: 'Templates',
  },
  {
    id: '6',
    name: 'Music Production Pack',
    description: 'Royalty-free music and sound effects library.',
    price: 39.99,
    image: '/images/music-pack.jpg',
    category: 'Media',
  },
];

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (product: Product) => {
    // Purchase handled in ProductCard component
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Digital Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Purchase products and earn credits on your first purchase
            </p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              First purchase earns <span className="font-bold text-green-600 dark:text-green-400">2 credits</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onPurchase={handlePurchase}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              How Credits Work
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Earn 2 credits on your first purchase when referred
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Your referrer also earns 2 credits when you make your first purchase
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Credits can be used to purchase any product in the marketplace
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Only the first purchase by a referred user triggers credit rewards
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductsPage;