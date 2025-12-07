'use client';

import React from 'react';
import ResetPasswordForm from '@/components/Auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Set New Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a strong new password for your account
          </p>
        </div>
        
        <ResetPasswordForm />
      </div>
    </div>
  );
};

// ⚠️ CRITICAL: This must be the last line
export const dynamic = 'force-dynamic';
export default ResetPasswordPage;