# Referral & Credit System

A modern full-stack referral and credit system built with Next.js, Express, MongoDB, and TypeScript.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with password hashing
- 📊 **Referral Tracking**: Track referrals, conversions, and earnings
- 💳 **Credit System**: Earn credits on first purchases
- 📱 **Modern UI**: Responsive dashboard with Tailwind CSS
- 🔄 **Real-time Updates**: Live tracking of referral activities
- 🛡️ **Data Integrity**: Prevent double-crediting and ensure consistency

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Framer Motion (Animations)
- Axios (API Client)

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Express Rate Limit

## Architecture

### System Flow
1. User registers with optional referral code
2. System generates unique referral link
3. Referred users sign up using the link
4. When referred user makes first purchase:
   - Both referrer and referred earn 2 credits
   - Referral status updates to "converted"
5. Users can track all activities in dashboard

### Database Schema
- **Users**: email, password (hashed), referralCode, credits
- **Referrals**: referrer, referred, status, creditsAwarded
- **Purchases**: user, product, amount, creditsEarned

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker (optional)

### Local Development

#### 1. Clone Repository
```bash
git clone <repository-url>
cd referral-system