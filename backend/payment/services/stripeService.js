import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create a checkout session for subscription
  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create or retrieve a Stripe customer
  async getOrCreateCustomer(email, name) {
    try {
      // Find existing customer
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        return customers.data[0];
      }
      
      // Create new customer if not found
      const customer = await stripe.customers.create({
        email,
        name,
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating/getting customer:', error);
      throw error;
    }
  }

  // Get subscription data
  async getSubscription(subscriptionId) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      return await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      return await stripe.subscriptions.update(
        subscriptionId,
        {
          items: [
            {
              id: subscriptionId,
              price: newPriceId,
            },
          ],
        }
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Get customer payment history
  async getPaymentHistory(customerId) {
    try {
      return await stripe.paymentIntents.list({
        customer: customerId,
        limit: 10,
      });
    } catch (error) {
      console.error('Error retrieving payment history:', error);
      throw error;
    }
  }

  // Get customer invoices
  async getInvoices(customerId) {
    try {
      return await stripe.invoices.list({
        customer: customerId,
        limit: 10,
      });
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const stripeService = new StripeService();
export default stripeService;