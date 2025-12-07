'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, Link as LinkIcon, MessageSquare, Mail, Facebook, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyLinkProps {
  referralCode: string;
}

const CopyLink: React.FC<CopyLinkProps> = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/register?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareViaEmail = () => {
    const subject = 'Join me on ReferralHub!';
    const body = `Hey! I'm using ReferralHub to earn credits by referring friends. Sign up using my link and we both get 2 credits when you make your first purchase!\n\n${referralLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaWhatsApp = () => {
    const text = `Join me on ReferralHub! Sign up using my link and we both get 2 credits when you make your first purchase! ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`);
  };

  const shareViaTwitter = () => {
    const text = `Join me on ReferralHub! Sign up using my link and earn credits! ${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on ReferralHub',
          text: 'Sign up using my referral link and earn credits!',
          url: referralLink,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <LinkIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Referral Link
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
            <LinkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white truncate focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span className="hidden sm:inline">Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center space-x-2"
                >
                  <Copy className="w-5 h-5" />
                  <span className="hidden sm:inline">Copy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shareLink}
          className="flex-1 flex items-center justify-center space-x-2 btn-primary py-3"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Link</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shareViaEmail}
          className="flex-1 flex items-center justify-center space-x-2 btn-secondary py-3"
        >
          <Mail className="w-5 h-5" />
          <span>Email</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Share via:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareViaWhatsApp}
                  className="flex items-center justify-center space-x-2 p-3 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/30 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    WhatsApp
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareViaFacebook}
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
                >
                  <Facebook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Facebook
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareViaTwitter}
                  className="flex items-center justify-center space-x-2 p-3 bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200 dark:hover:bg-sky-800/30 rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <span className="text-sm font-medium text-sky-700 dark:text-sky-300">
                    Twitter
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex items-center justify-center space-x-2 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Copy
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-bold">💡</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Pro Tip: Maximize Your Referrals
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Share your link on social media and in relevant communities
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Explain how friends can earn credits too
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Follow up with friends who signed up but haven't purchased yet
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>How it works:</strong> Share this link with friends. When they sign up and make their first purchase, <strong>both of you earn 2 credits</strong>!
        </p>
      </div>
    </motion.div>
  );
};

export default CopyLink;