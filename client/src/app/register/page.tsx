'use client';

import React from 'react';
import { motion } from 'framer-motion';
import RegisterForm from '@/components/Auth/RegisterForm';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const RegisterPage = () => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sign up today and start earning credits by referring friends. Get 2 credits for every successful referral!
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          <div className="lg:w-1/2">
            <RegisterForm />
          </div>
          
          <div className="lg:w-1/2">
            <div className="card p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Why Join ReferralHub?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">🎁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Earn Free Credits
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get 2 credits for every friend who signs up and makes their first purchase.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Real Rewards
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Use credits to purchase digital products, courses, and templates.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-xl">📈</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Track Your Earnings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Monitor your referrals, conversions, and earnings in real-time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">🔗</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Easy Sharing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get a unique referral link that you can share anywhere.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                <h3 className="font-bold text-primary-700 dark:text-primary-300 mb-2">
                  🎉 Special Bonus for New Users
                </h3>
                <p className="text-primary-600 dark:text-primary-400 text-sm">
                  Sign up with a referral code to earn <strong>2 credits immediately</strong> when you make your first purchase!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;