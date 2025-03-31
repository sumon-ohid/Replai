import stripeService from '../services/stripeService.js';
import User from '../../models/User.js';
export const createCheckoutSession = async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const userId = req.user.id; // Assuming req.user is set by auth middleware
    
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.getOrCreateCustomer(user.email, user.name);
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      user.stripeCustomerId = customerId;
      await user.save();
    }
    
    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId, 
      priceId, 
      successUrl || `${process.env.FRONTEND_URL}/billing?success=true`,
      cancelUrl || `${process.env.FRONTEND_URL}/billing?canceled=true`
    );
    
    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Payment session creation failed:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Failed to get subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    const canceledSubscription = await stripeService.cancelSubscription(user.stripeSubscriptionId);
    
    // Update user subscription status
    user.subscriptionStatus = 'canceled';
    user.subscriptionEndDate = new Date(canceledSubscription.current_period_end * 1000);
    await user.save();
    
    res.status(200).json({ message: 'Subscription successfully canceled', subscription: canceledSubscription });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { newPriceId } = req.body;
    const userId = req.user.id;
    
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    const updatedSubscription = await stripeService.updateSubscription(user.stripeSubscriptionId, newPriceId);
    
    res.status(200).json({ message: 'Subscription successfully updated', subscription: updatedSubscription });
  } catch (error) {
    console.error('Failed to update subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.stripeCustomerId) {
      return res.status(404).json({ message: 'No payment history found' });
    }
    
    const paymentHistory = await stripeService.getPaymentHistory(user.stripeCustomerId);
    const invoices = await stripeService.getInvoices(user.stripeCustomerId);
    
    // Combine and format payment data
    const formattedHistory = invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: `${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`,
      status: invoice.paid ? 'Paid' : 'Unpaid',
      method: invoice.payment_method_details ? invoice.payment_method_details.type : 'N/A',
      invoice_pdf: invoice.invoice_pdf
    }));
    
    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Failed to get payment history:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};