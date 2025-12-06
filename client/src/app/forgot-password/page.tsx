'use client';

import React from 'react';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        <ForgotPasswordForm />
        
        <div className="mt-8 card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            📧 Need help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            If you're having trouble resetting your password, please check your spam folder or 
            contact our support team at <strong>support@referralhub.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;