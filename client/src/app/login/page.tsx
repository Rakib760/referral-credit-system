'use client';

import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/Auth/LoginForm';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

const LoginPage = () => {
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
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          <div className="lg:w-1/2">
            <LoginForm />
            
            <div className="mt-8 card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔐 Security Notice
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your security is important to us. We use industry-standard encryption to protect your data.
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="card p-8 h-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Why ReferralHub?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Join thousands of users who are earning credits every day
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Fast & Easy Earnings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Start earning credits within minutes of signing up
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Grow Together
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Both you and your friends earn when they make purchases
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Secure & Reliable
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Bank-level security for all transactions and data
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  🚀 Ready to Start Earning?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Don't have an account yet? Join our referral program and start earning today.
                </p>
                
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center w-full btn-primary py-3"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  💡 Pro Tip
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Use a referral code when signing up to earn bonus credits on your first purchase!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;