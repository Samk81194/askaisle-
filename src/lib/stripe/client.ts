import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-01-27.acacia' as any,
  typescript: true,
});

export const STRIPE_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceUsd: 19,
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
    quotaMessages: 500,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    priceUsd: 39,
    priceId: process.env.STRIPE_PRICE_GROWTH || 'price_growth_placeholder',
    quotaMessages: 2000,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceUsd: 79,
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
    quotaMessages: 6000,
  },
};
