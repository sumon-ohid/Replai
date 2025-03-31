import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: string;
  status: string;
  method: string;
  invoice_pdf?: string;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  current_period_end: number;
  current_period_start: number;
  plan: {
    id: string;
    amount: number;
    interval: string;
    currency: string;
  };
}

export default function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create checkout session and redirect to Stripe
  const createCheckoutSession = async (priceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<{
        url: string;
      }>(
        `${API_URL}/payments/create-checkout-session`,
        {
          priceId,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
      
      return response.data;
    } catch (err) {
      console.error('Payment session creation failed:', err);
      setError('Failed to create payment session. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Get current subscription details
  const getSubscription = async (): Promise<SubscriptionDetails | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<SubscriptionDetails>(`${API_URL}/payments/subscription`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (err) {
      console.error('Failed to get subscription details:', err);
      setError('Failed to load subscription details.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel subscription
  const cancelSubscription = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(`${API_URL}/payments/cancel-subscription`, {}, {
        withCredentials: true,
      });
      
      return true;
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update subscription (e.g., change from monthly to yearly)
  const updateSubscription = async (newPriceId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_URL}/payments/update-subscription`,
        {
          newPriceId,
        },
        {
          withCredentials: true,
        }
      );
      
      return true;
    } catch (err) {
      console.error('Failed to update subscription:', err);
      setError('Failed to update subscription. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Get payment history
  const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<PaymentHistoryItem[]>(`${API_URL}/payments/payment-history`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (err) {
      console.error('Failed to get payment history:', err);
      setError('Failed to load payment history.');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    createCheckoutSession,
    getSubscription,
    cancelSubscription,
    updateSubscription,
    getPaymentHistory,
  };
}