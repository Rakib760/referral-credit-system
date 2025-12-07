'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  Award, 
  Home, 
  LogOut, 
  RefreshCw,
  Share2,
  ShoppingBag,
  Activity,
  UserCheck,
  DollarSign,
  Percent
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { referralApi, purchaseApi } from '@/utils/api';
import StatsCard from '@/components/Dashboard/StatsCard';
import CopyLink from '@/components/Dashboard/CopyLink';
import ReferralTable from '@/components/Dashboard/ReferralTable';
import { ReferralStats, ReferralHistory, Purchase } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

const DashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, updateUser } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralHistory[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, historyData, purchasesData] = await Promise.all([
        referralApi.getStats(),
        referralApi.getHistory(),
        purchaseApi.getHistory()
      ]) as any[];

      // Cast each response to its expected type
      const typedStatsData = statsData as { stats?: ReferralStats } | ReferralStats;
      const typedHistoryData = historyData as { referrals?: ReferralHistory[] };
      const typedPurchasesData = purchasesData as { purchases?: Purchase[] };

      // Handle the data based on actual structure
      if ('stats' in typedStatsData) {
        setStats(typedStatsData.stats || null);
      } else {
        setStats(typedStatsData as ReferralStats);
      }
      
      setReferrals(typedHistoryData.referrals || []);
      setPurchases(typedPurchasesData.purchases || []);
      setLastUpdated(new Date());
      
      // Update user credits - FIXED
      let currentStats: ReferralStats | null = null;
      
      if ('stats' in typedStatsData) {
        currentStats = typedStatsData.stats || null;
      } else {
        currentStats = typedStatsData as ReferralStats;
      }
      
      if (currentStats && user && currentStats.currentCredits !== user.credits) {
        updateUser({ credits: currentStats.currentCredits });
      }

      toast.success('Dashboard updated!');
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const simulatePurchase = async () => {
    try {
      const product = {
        id: 'prod_' + Date.now(),
        name: 'Test Product',
        amount: 29.99
      };

      const response = await purchaseApi.createPurchase(
        product.id,
        product.name,
        product.amount
      ) as any;

      // Update local state
      updateUser({ credits: response.user?.credits || response.credits });
      
      // Refresh dashboard data
      fetchDashboardData();
      
      toast.success(
        response.referral 
          ? `Purchase successful! Earned ${response.purchase?.referralCreditsAwarded ? '2 credits!' : 'no credits'}`
          : 'Purchase completed!'
      );
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Calculate real stats from data
 // Calculate real stats from data
const realStats = {
  totalReferred: stats?.totalReferred || 0,
  convertedUsers: stats?.convertedUsers || 0,
  totalCreditsEarned: stats?.totalCreditsEarned || 0,
  currentCredits: stats?.currentCredits || user?.credits || 0,
  // Calculate conversion rate
  conversionRate: stats?.totalReferred ? Math.round((stats.convertedUsers / stats.totalReferred) * 100) : 0,
  // Calculate from purchases
  totalPurchaseAmount: purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
  averagePurchaseValue: purchases.length > 0 ? Math.round(purchases.reduce((sum, purchase) => sum + purchase.amount, 0) / purchases.length) : 0,
  // From referral data - Use correct status values
  activeReferrals: referrals.filter(ref => ref.status === 'pending' || ref.status === 'converted').length,
  completedReferrals: referrals.filter(ref => ref.status === 'converted').length
};

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Welcome Card */}
        <div className="card p-6 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Welcome back, {user?.name || user?.email?.split('@')[0]}! 👋
                  </h1>
                  <p className="opacity-90 mt-1">
                    Here's what's happening with your referral program today
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoHome}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                title="Go to Homepage"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </motion.button>

              <Link
                href="/products"
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Products</span>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Credits Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Credits</p>
                <p className="text-3xl font-bold mt-2">{realStats.currentCredits}</p>
                <p className="text-sm opacity-90 mt-1">Ready to use</p>
              </div>
              <CreditCard className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Referral Code</p>
                <p className="text-xl font-bold mt-2 font-mono">{user?.referralCode}</p>
                <p className="text-sm opacity-90 mt-1">Share to earn</p>
              </div>
              <Share2 className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Purchases</p>
                <p className="text-3xl font-bold mt-2">{purchases.length}</p>
                <p className="text-sm opacity-90 mt-1">All time</p>
              </div>
              <ShoppingBag className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <button
            onClick={simulatePurchase}
            className="card p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Test Purchase</p>
                <p className="text-lg font-bold mt-2">Earn 2 Credits</p>
                <p className="text-sm opacity-90 mt-1">Click to simulate</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">+2</span>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Performance Overview - REAL DATA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Performance Overview
          </h2>
          <button
            onClick={refreshData}
            className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))
          ) : (
            <>
              {/* Total Referred - From backend */}
              <StatsCard
                title="Total Referred"
                value={realStats.totalReferred}
                icon={<Users className="w-6 h-6" />}
                color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                change={realStats.totalReferred > 0 ? `+${realStats.totalReferred}` : undefined}
              />
              
              {/* Active Referrals - Calculated from referral data */}
              <StatsCard
                title="Active Referrals"
                value={realStats.activeReferrals}
                icon={<UserCheck className="w-6 h-6" />}
                color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                change={realStats.activeReferrals > 0 ? `+${realStats.activeReferrals}` : undefined}
              />
              
              {/* Total Revenue - Calculated from purchases */}
              <StatsCard
                title="Total Revenue"
                value={`$${realStats.totalPurchaseAmount}`}
                icon={<DollarSign className="w-6 h-6" />}
                color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                change={realStats.totalPurchaseAmount > 0 ? `+$${realStats.totalPurchaseAmount}` : undefined}
              />
              
              {/* Conversion Rate - Calculated */}
              <StatsCard
                title="Conversion Rate"
                value={`${realStats.conversionRate}%`}
                icon={<Percent className="w-6 h-6" />}
                color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                change={realStats.conversionRate > 0 ? `+${realStats.conversionRate}%` : undefined}
              />
            </>
          )}
        </div>
      </motion.div>

      {/* Credits & Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Credits Earned"
          value={realStats.totalCreditsEarned}
          icon={<Award className="w-6 h-6" />}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          change={realStats.totalCreditsEarned > 0 ? `+${realStats.totalCreditsEarned}` : undefined}
        />
        
        <StatsCard
          title="Converted Users"
          value={realStats.convertedUsers}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          change={realStats.convertedUsers > 0 ? `+${realStats.convertedUsers}` : undefined}
        />
        
        <StatsCard
          title="Avg. Purchase Value"
          value={`$${realStats.averagePurchaseValue}`}
          icon={<CreditCard className="w-6 h-6" />}
          color="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
          change={realStats.averagePurchaseValue > 0 ? `+$${realStats.averagePurchaseValue}` : undefined}
        />
        
        <StatsCard
          title="Completed Referrals"
          value={realStats.completedReferrals}
          icon={<Activity className="w-6 h-6" />}
          color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
          change={realStats.completedReferrals > 0 ? `+${realStats.completedReferrals}` : undefined}
        />
      </motion.div>

      {/* Referral Link & History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Link - Takes 2/3 on large screens */}
        <div className="lg:col-span-2">
          <CopyLink referralCode={user?.referralCode || ''} />
        </div>

        {/* Quick Stats - Takes 1/3 on large screens */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              📈 Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Today's Clicks</span>
                <span className="font-semibold">{referrals.filter(r => 
                  new Date(r.createdAt).toDateString() === new Date().toDateString()
                ).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">This Week</span>
                <span className="font-semibold">{referrals.filter(r => {
                  const date = new Date(r.createdAt);
                  const today = new Date();
                  const weekAgo = new Date(today.setDate(today.getDate() - 7));
                  return date > weekAgo;
                }).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">This Month</span>
                <span className="font-semibold">{referrals.filter(r => {
                  const date = new Date(r.createdAt);
                  const today = new Date();
                  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
                }).length}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              💡 Pro Tip
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share your link on social media to increase conversions. 
              Personal messages work better than group posts!
            </p>
          </div>
        </div>
      </div>

      {/* Referral History & Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Referral History
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {referrals.length} records
            </span>
          </div>
          <ReferralTable referrals={referrals} />
        </div>

        {/* Recent Purchases */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Purchases
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {purchases.length} purchases
            </span>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {purchases.slice(0, 5).map((purchase, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {purchase.productName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${purchase.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {purchase.referralCreditsAwarded ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            +2 Credits
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {purchases.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No purchases yet. Make your first purchase to earn credits!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Data refreshes automatically. Click "Refresh" to update manually.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;